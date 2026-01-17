import Organizations from "./Organizations";
import IOrganizer from "@/lib/interfaces/Redux/IOrganizer";

interface OrganizationListProps {
  allOrganizations: [IOrganizer],
  onDeleteClick: (id: string) => void
}

export default function OrganizationList(props: OrganizationListProps) {
  const {
    onDeleteClick,
    allOrganizations
  } = props;

  // Ensure allOrganizations is always an array to prevent crashes
  const safeOrganizations = Array.isArray(allOrganizations) ? allOrganizations : [];

  return safeOrganizations.map((element, index) => (
    <Organizations key={index}
      name={element?.name}
      logo={element?.logo}
      onDeleteClick={() => onDeleteClick(element?._id ?? "")}
    />
  ))
}
