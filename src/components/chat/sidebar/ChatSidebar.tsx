import { useOpenAI } from "@/context/ChatCompletionProvider";
import Link from "next/link";
import { MdAdd, MdBuild, MdDeleteOutline } from "react-icons/md";
import ApiKey from "./buttons/ApiKey";
import ButtonContainer from "./buttons/ButtonContainer";
import CurrentModel from "./buttons/CurrentModel";
import ThemeButton from "./buttons/ThemeButton";
import Conversations from "./conversation/Conversations";

type Props = {};

export default function ChatSidebar({}: Props) {
  const { clearConversations } = useOpenAI();

  return (
    <div className="dark left-0 top-0 h-full max-h-screen flex-col bg-gray-900 text-primary md:fixed md:flex md:w-[260px]">
      <div className="flex h-full flex-col items-stretch p-2">
        <Link
          href="/"
          className="flex items-center gap-3 rounded border border-white/20 p-4 transition-colors hover:bg-gray-500/10"
        >
          <MdAdd />
          New chat
        </Link>

        <Conversations />

        <div className="flex flex-col gap-y-2 border-y border-white/10 py-2">
          {/* <div className="flex flex-col gap-y-2 border-b border-white/10">
            <CurrentModel />
            <ApiKey />
          </div> */}
          <Link
            className="flex items-center gap-3 rounded p-3 transition-colors hover:bg-gray-500/10"
            href="/playground"
          >
            <MdBuild />
            Settings
          </Link>
          {/* <ButtonContainer onClick={clearConversations}>
            <MdDeleteOutline />
            Clear Conversations
          </ButtonContainer>

          <ThemeButton /> */}
        </div>
      </div>
    </div>
  );
}
