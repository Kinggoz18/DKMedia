import Exit from "./Exit";

interface AboutUsParagraphsProps {
  paragraphs: string[],
  updatedParagraphs: string[]
  onDeleteParagraph: (s: string) => void
}

export default function AboutUsParagraphs(props: AboutUsParagraphsProps) {
  const { paragraphs, updatedParagraphs, onDeleteParagraph } = props;

  // Ensure arrays are always arrays to prevent crashes
  const safeUpdatedParagraphs = Array.isArray(updatedParagraphs) ? updatedParagraphs : [];
  const safeParagraphs = Array.isArray(paragraphs) ? paragraphs : [];

  const NewParagraphs = () => safeUpdatedParagraphs.map((element, index) => (
    <div className="my-4 flex flex-row" key={index}>
      {element}
      <Exit onClick={() => onDeleteParagraph(element)} className="ml-3 w-[70px]"></Exit>
    </div>
  ))
  const PrevParagraphs = () => safeParagraphs.map((element, index) => (
    <div className="my-4" key={index}>{element}</div>
  ))

  return (<div className="max-h-[300px] overflow-y-scroll">
    <NewParagraphs />
    <PrevParagraphs />
  </div>)
}