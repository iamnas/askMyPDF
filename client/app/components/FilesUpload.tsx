'use client'

import { Upload } from "lucide-react"

export default function FilesUpload() {

    const handleUploadFiles = async () => {

        try {
            const element = document.createElement('input');
            element.setAttribute('type', 'file');
            element.setAttribute('accept', 'application/pdf');

            element.addEventListener('change', async function (event) {
                const files = (event.target as HTMLInputElement)?.files as FileList;

                if (files.length > 0) {
                    console.log(files[0]);
                    const formData = new FormData();
                    formData.append('pdf', files[0]);
                    const res = await fetch(`http://localhost:8000/upload/pdf`, {
                        method: 'POST',
                        body: formData
                    })

                    console.log(`response: ${res.status}`);


                }

                // console.log(files);
            });


            element.click();
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <div className="flex flex-col items-center justify-center">
            <div onClick={handleUploadFiles} className=" border p-6 flex flex-col items-center justify-center">
                <h1 className="text-4xl font-bold">Upload Files</h1>
                <Upload />
            </div>

        </div>
    )
}
