type Props = {};

export default function ChatPlaceholder({}: Props) {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="max-w-3xl p-4 text-center text-gray-600">
        <h1 className="text-4xl font-bold font-medium">ChatGPT</h1>

        <div className="m-4 flex items-center justify-center"></div>
      </div>
    </div>
  );
}
