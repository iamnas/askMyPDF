import FilesUpload from "./components/FilesUpload";


export default function Home() {
  return (

    <div className="min-h-screen w-screen grid  grid-cols-3 bg-gray-300 ">
      <div className=" border-r-2 border-gray-800 col-span-1 flex flex-col items-center justify-center">
        <FilesUpload />
      </div>
      <div className="col-span-2 border-r-2 border-gray-800">
        2
      </div>
    </div>

  );
}
