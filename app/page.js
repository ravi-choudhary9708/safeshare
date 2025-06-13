import Head from "next/head";
import FileUploader from "../components/FileUploader";

export default function Home() {
  return (
    <>
      <Head>
        <title>File Upload</title>
      </Head>
      <main className="flex items-center justify-center min-h-screen bg-gray-100">
        <FileUploader />
      </main>
    </>
  );
}

