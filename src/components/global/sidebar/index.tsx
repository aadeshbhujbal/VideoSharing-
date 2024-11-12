"use client";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React from "react";

type Props = {
  activeWorkspaceId: string;
};

const Sidebar = ({ activeWorkspaceId }: Props) => {
  const router = useRouter();
  const onChangeActiveWorkspace = (value: string) => {
    router.push(`/dashboard/${value}`);
  };
  return (
    <div className="bg-[#111111] flex-none relative p-4 h-full w-[250px] flex flex-col gap-4 items-center overflow-hidden">
      <div className="bg-[#111111] p-4 gap-2 justify-center items-center mb-2 absolute top-4 left-0 right-0">
        <Image src={"/opal-logo.svg"} height={40} width={40} alt="Logo" />
        <p className="text-2xl ">Opal</p>
      </div>
      <Select
        defaultValue={activeWorkspaceId}
        onValueChange={onChangeActiveWorkspace}
      >
        <SelectTrigger className="mt-16 text-neutral-400 bg-transparent">
          <SelectValue placeholder="Select A Workspace"></SelectValue>
        </SelectTrigger>
        <SelectContent className="bg-[#111111] backdrop-blur-xl ">
          <SelectGroup>
            <SelectLabel>Workspace </SelectLabel>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};

export default Sidebar;
