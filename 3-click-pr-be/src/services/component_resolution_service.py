"""
Component Resolution Service

Handles the logic for resolving which salary components apply to an employee
based on their designation and individual overrides.
"""

from typing import List, Dict, Optional
from beanie import PydanticObjectId

from src.schemas.salary_component import (
    SalaryComponent,
    DesignationComponentMapping,
    EmployeeComponentOverride,
    ComponentType
)
from src.schemas.employee import Employee


class ResolvedComponent:
    """A resolved salary component with its final values"""

    def __init__(
        self,
        component: SalaryComponent,
        default_value: Optional[float] = None,
        percentage: Optional[float] = None,
        is_mandatory: bool = False,
        source: str = "component"  # component, designation, employee
    ):
        self.component = component
        self.default_value = default_value or component.default_value
        self.percentage = percentage or component.percentage
        self.is_mandatory = is_mandatory
        self.source = source

    def to_dict(self) -> Dict:
        """Convert to dictionary representation"""
        return {
            "id": str(self.component.id),
            "name": self.component.name,
            "display_name": self.component.display_name,
            "component_type": self.component.component_type,
            "calculation_type": self.component.calculation_type,
            "default_value": self.default_value,
            "percentage": self.percentage,
            "min_value": self.component.min_value,
            "max_value": self.component.max_value,
            "taxable": self.component.taxable,
            "affects_cpp": self.component.affects_cpp,
            "affects_ei": self.component.affects_ei,
            "is_statutory": self.component.is_statutory,
            "is_mandatory": self.is_mandatory,
            "display_order": self.component.display_order,
            "description": self.component.description,
            "source": self.source
        }


class ComponentResolutionService:
    """Service for resolving salary components for employees"""

    @staticmethod
    async def get_components_for_employee(
        employee_id: str,
        component_type: Optional[ComponentType] = None
    ) -> List[ResolvedComponent]:
        """
        Get all applicable salary components for an employee

        Resolution priority:
        1. Employee-specific overrides (highest priority)
        2. Designation-specific mappings
        3. Global components (applies_to_all_designations=True)

        Args:
            employee_id: Employee ID
            component_type: Optional filter by component type

        Returns:
            List of resolved components with final values
        """
        # Get employee
        employee = await Employee.get(employee_id)
        if not employee:
            raise ValueError(f"Employee {employee_id} not found")

        designation_id = employee.designation_id

        # Get employee overrides
        override_filter = {"employee_id": employee_id}
        if component_type:
            override_filter["component_type"] = component_type

        overrides = await EmployeeComponentOverride.find(override_filter).to_list()
        override_map = {o.component_id: o for o in overrides}

        # Get designation mappings if employee has a designation
        designation_mappings = []
        if designation_id:
            mapping_filter = {"designation_id": designation_id, "is_active": True}
            if component_type:
                mapping_filter["component_type"] = component_type

            designation_mappings = await DesignationComponentMapping.find(mapping_filter).to_list()

        designation_component_ids = {m.component_id for m in designation_mappings}
        designation_map = {m.component_id: m for m in designation_mappings}

        # Get all active components
        component_filter = {"is_active": True}
        if component_type:
            component_filter["component_type"] = component_type

        all_components = await SalaryComponent.find(component_filter).to_list()

        resolved_components = []

        for component in all_components:
            component_id = str(component.id)

            # Check if component is disabled by employee override
            if component_id in override_map and not override_map[component_id].is_enabled:
                continue

            # Determine if component applies to this employee
            applies = False
            is_mandatory = False
            default_value = component.default_value
            percentage = component.percentage
            source = "component"

            # Priority 1: Employee override
            if component_id in override_map:
                override = override_map[component_id]
                if override.is_enabled:
                    applies = True
                    source = "employee"
                    if override.override_values:
                        default_value = override.override_values.default_value or default_value
                        percentage = override.override_values.percentage or percentage

            # Priority 2: Designation mapping
            elif component_id in designation_component_ids:
                mapping = designation_map[component_id]
                applies = True
                is_mandatory = mapping.is_mandatory
                source = "designation"
                # Use designation-specific defaults if provided
                default_value = mapping.default_value or default_value
                percentage = mapping.percentage or percentage

            # Priority 3: Global component
            elif component.applies_to_all_designations:
                # Check if component is restricted to specific designations
                if not component.applicable_designations:
                    # No restrictions, applies to all
                    applies = True
                elif designation_id and designation_id in component.applicable_designations:
                    # Employee's designation is in the allowed list
                    applies = True

            if applies:
                resolved_components.append(
                    ResolvedComponent(
                        component=component,
                        default_value=default_value,
                        percentage=percentage,
                        is_mandatory=is_mandatory,
                        source=source
                    )
                )

        # Sort by display_order
        resolved_components.sort(key=lambda rc: rc.component.display_order)

        return resolved_components

    @staticmethod
    async def get_components_for_designation(
        designation_id: str,
        component_type: Optional[ComponentType] = None
    ) -> List[ResolvedComponent]:
        """
        Get all applicable salary components for a designation

        Args:
            designation_id: Designation ID
            component_type: Optional filter by component type

        Returns:
            List of resolved components with designation-specific values
        """
        # Get designation mappings
        mapping_filter = {"designation_id": designation_id, "is_active": True}
        if component_type:
            mapping_filter["component_type"] = component_type

        designation_mappings = await DesignationComponentMapping.find(mapping_filter).to_list()
        designation_component_ids = {m.component_id for m in designation_mappings}
        designation_map = {m.component_id: m for m in designation_mappings}

        # Get all active components
        component_filter = {"is_active": True}
        if component_type:
            component_filter["component_type"] = component_type

        all_components = await SalaryComponent.find(component_filter).to_list()

        resolved_components = []

        for component in all_components:
            component_id = str(component.id)

            applies = False
            is_mandatory = False
            default_value = component.default_value
            percentage = component.percentage
            source = "component"

            # Priority 1: Designation mapping
            if component_id in designation_component_ids:
                mapping = designation_map[component_id]
                applies = True
                is_mandatory = mapping.is_mandatory
                source = "designation"
                default_value = mapping.default_value or default_value
                percentage = mapping.percentage or percentage

            # Priority 2: Global component
            elif component.applies_to_all_designations:
                if not component.applicable_designations:
                    applies = True
                elif designation_id in component.applicable_designations:
                    applies = True

            if applies:
                resolved_components.append(
                    ResolvedComponent(
                        component=component,
                        default_value=default_value,
                        percentage=percentage,
                        is_mandatory=is_mandatory,
                        source=source
                    )
                )

        # Sort by display_order
        resolved_components.sort(key=lambda rc: rc.component.display_order)

        return resolved_components

    @staticmethod
    async def assign_component_to_designation(
        designation_id: str,
        component_id: str,
        is_mandatory: bool = True,
        default_value: Optional[float] = None,
        percentage: Optional[float] = None,
        created_by: Optional[str] = None
    ) -> DesignationComponentMapping:
        """
        Assign a salary component to a designation

        Args:
            designation_id: Designation ID
            component_id: Component ID
            is_mandatory: Whether component is mandatory for this position
            default_value: Position-specific default value
            percentage: Position-specific percentage
            created_by: User creating the mapping

        Returns:
            Created or updated mapping
        """
        # Check if mapping already exists
        existing = await DesignationComponentMapping.find_one({
            "designation_id": designation_id,
            "component_id": component_id
        })

        if existing:
            # Update existing mapping
            existing.is_mandatory = is_mandatory
            existing.default_value = default_value
            existing.percentage = percentage
            existing.is_active = True
            await existing.save()
            return existing

        # Get component details
        component = await SalaryComponent.get(component_id)
        if not component:
            raise ValueError(f"Component {component_id} not found")

        # Get designation details
        from src.schemas.organization import Designation
        designation = await Designation.get(designation_id)
        if not designation:
            raise ValueError(f"Designation {designation_id} not found")

        # Create new mapping
        mapping = DesignationComponentMapping(
            designation_id=designation_id,
            designation_name=designation.title,
            component_id=component_id,
            component_name=component.name,
            component_type=component.component_type,
            is_mandatory=is_mandatory,
            default_value=default_value,
            percentage=percentage,
            created_by=created_by
        )

        await mapping.insert()
        return mapping

    @staticmethod
    async def remove_component_from_designation(
        designation_id: str,
        component_id: str
    ) -> bool:
        """
        Remove a salary component from a designation

        Args:
            designation_id: Designation ID
            component_id: Component ID

        Returns:
            True if removed, False if not found
        """
        mapping = await DesignationComponentMapping.find_one({
            "designation_id": designation_id,
            "component_id": component_id
        })

        if mapping:
            await mapping.delete()
            return True

        return False

    @staticmethod
    async def set_employee_component_override(
        employee_id: str,
        component_id: str,
        is_enabled: bool = True,
        override_default_value: Optional[float] = None,
        override_percentage: Optional[float] = None,
        notes: Optional[str] = None,
        created_by: Optional[str] = None
    ) -> EmployeeComponentOverride:
        """
        Set or update an employee-specific component override

        Args:
            employee_id: Employee ID
            component_id: Component ID
            is_enabled: Whether component is enabled for this employee
            override_default_value: Custom default value
            override_percentage: Custom percentage
            notes: Notes about the override
            created_by: User creating the override

        Returns:
            Created or updated override
        """
        from src.schemas.salary_component import ComponentOverrideValue

        # Check if override already exists
        existing = await EmployeeComponentOverride.find_one({
            "employee_id": employee_id,
            "component_id": component_id
        })

        override_values = None
        if override_default_value is not None or override_percentage is not None:
            override_values = ComponentOverrideValue(
                default_value=override_default_value,
                percentage=override_percentage
            )

        if existing:
            # Update existing override
            existing.is_enabled = is_enabled
            existing.override_values = override_values
            existing.notes = notes
            await existing.save()
            return existing

        # Get component details
        component = await SalaryComponent.get(component_id)
        if not component:
            raise ValueError(f"Component {component_id} not found")

        # Create new override
        override = EmployeeComponentOverride(
            employee_id=employee_id,
            component_id=component_id,
            component_name=component.name,
            component_type=component.component_type,
            is_enabled=is_enabled,
            override_values=override_values,
            notes=notes,
            created_by=created_by
        )

        await override.insert()
        return override

    @staticmethod
    async def remove_employee_component_override(
        employee_id: str,
        component_id: str
    ) -> bool:
        """
        Remove an employee-specific component override

        Args:
            employee_id: Employee ID
            component_id: Component ID

        Returns:
            True if removed, False if not found
        """
        override = await EmployeeComponentOverride.find_one({
            "employee_id": employee_id,
            "component_id": component_id
        })

        if override:
            await override.delete()
            return True

        return False
