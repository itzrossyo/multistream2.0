import Image from "next/image";
import MultiStreamViewer from "./componemts/multistream";
import Breach from "./componemts/breach";

export default function Home() {
  return (
    <div>
      <Breach />
      <MultiStreamViewer/>
        </div>
  );
}
