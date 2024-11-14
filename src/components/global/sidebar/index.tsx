"use client";
import { getWorkSpaces } from "@/actions/workspace";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useQueryData } from "@/hooks/useQueryData";
import { NotificationProps, WorkspaceProps } from "@/types/index.type";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import React, { Children } from "react";
import Modal from "../modal";
import { Menu, PlusCircle } from "lucide-react";
import Search from "../search";
import Link from "next/link";
import SidebarItem from "./sidebar-items";
import { MENU_ITEMS } from "@/constants";
import { getNotifications } from "@/actions/user";
import WorkspacePlaceholder from "./WorkspacePlaceholder";
import { Global } from "recharts";
import GlobalCard from "../global-card";
import { Button } from "@/components/ui/button";
import Loader from "../loader";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

type Props = {
  activeWorkspaceId: string;
};

const Sidebar = ({ activeWorkspaceId }: Props) => {
  const router = useRouter();
  const pathname = usePathname();
  const { data, isFetched } = useQueryData(["user-workspaces"], getWorkSpaces);

  const menuItems = MENU_ITEMS(activeWorkspaceId);

  const { data: notifications } = useQueryData(
    ["user-notifications"],
    getNotifications
  );

  const { data: workspace } = data as WorkspaceProps;

  const { data: count } = notifications as NotificationProps;

  const onChangeActiveWorkspace = (value: string) => {
    router.push(`/dashboard/${value}`);
  };

  const currentWorkspace = workspace.workspace.find(
    (workspace) => workspace.id === activeWorkspaceId
  );
  // console.log(activeWorkspaceId);
  return (
    <div className="bg-[#111111] flex-none relative p-4 h-full w-[250px] flex flex-col gap-4 items-center overflow-hidden">
      <div className="bg-[#111111] p-4 flex gap-2 justify-center items-center mb-4 absolute top-0 left-0 right-0 ">
        <Image src="/opal-logo.svg" height={40} width={40} alt="logo" />
        <p className="text-2xl">Opal</p>
      </div>
      <Select
        defaultValue={activeWorkspaceId}
        onValueChange={onChangeActiveWorkspace}
      >
        <SelectTrigger className="!mt-16 !text-white  bg-transparent">
          <SelectValue placeholder="Select A Workspace"></SelectValue>
        </SelectTrigger>
        <SelectContent className="bg-[#111111] backdrop-blur-xl ">
          <SelectGroup>
            <SelectLabel>Workspace </SelectLabel>
            <Separator />
            {workspace.workspace.map((workspace) => (
              <SelectItem key={workspace.id} value={workspace.id}>
                {workspace.name}
              </SelectItem>
            ))}

            {workspace.members.length > 0 &&
              workspace.members.map(
                (workspace) =>
                  workspace.WorkSpace && (
                    <SelectItem
                      value={workspace.WorkSpace.id}
                      key={workspace.WorkSpace.id}
                    >
                      {workspace.WorkSpace.name}
                    </SelectItem>
                  )
              )}
          </SelectGroup>
        </SelectContent>
      </Select>
      {currentWorkspace?.type === "PUBLIC" &&
        workspace.subscription?.plan === "PRO" && (
          <Modal
            title="Invite to Workspace"
            description="Invite other Users to  Workspace"
            trigger={
              <span className="text-sm cursor-pointer flex items-center justify-center border-t-neutral-800/70 hover:neutral-800/60 w-full rounded-sm p-[5px] gap-2">
                {" "}
                <PlusCircle
                  size={15}
                  className="text-neutral-800/90 fill-neutral-500"
                />
                <span className="text-neutral-400 font-semibold text-xs">
                  {" "}
                  Invite To Workspace
                </span>
              </span>
            }
          >
            <Search workspaceId={activeWorkspaceId} />
          </Modal>
        )}
      <p className="w-full text-[#9D9D9D] font-bold mt-4">Menu</p>
      <nav className="w-full ">
        <ul>
          {menuItems.map((item) => (
            <SidebarItem
              key={item.title}
              icon={item.icon}
              title={item.title}
              href={item.href}
              selected={pathname === item.href}
              notifications={
                (item.title === "Notifications" &&
                  count._count &&
                  count._count.notifications) ||
                0
              }
            />
          ))}
        </ul>
      </nav>
      <Separator className="w-45" />
      <p className="w-full text-[#9D9D9D] font-bold mt-4">Workspaces</p>

      {workspace.workspace.length === 1 && workspace.members.length === 0 && (
        <div className="w-full mt-[-10px]">
          <p className="text-[#3c3c3c] font-medium text-sm">
            {workspace.subscription?.plan === "FREE"
              ? "Upgrade To Create Workspaces"
              : "No Workspace"}
          </p>{" "}
        </div>
      )}
      <nav className="w-full ">
        <ul className="h-[150px] overflow-auto overflow-x-hidden fade-layer">
          {workspace.workspace.length > 0 &&
            workspace.workspace.map(
              (member) =>
                member.type !== "PERSONAL" && (
                  <SidebarItem
                    key={member.id}
                    href={`/dashboard/${member.id}`}
                    selected={pathname === `/dashboard/${member.id}`}
                    title={member.name}
                    notifications={0}
                    icon={
                      <WorkspacePlaceholder>
                        {member.name.charAt(0)}
                      </WorkspacePlaceholder>
                    }
                  />
                )
            )}
          {workspace.members.length > 0 &&
            workspace.members.map((member) => (
              <SidebarItem
                key={member.WorkSpace.id}
                href={`/dashboard/${member.WorkSpace.id}`}
                selected={pathname === `/dashboard/${member.WorkSpace.id}`}
                title={member.WorkSpace.name}
                notifications={0}
                icon={
                  <WorkspacePlaceholder>
                    {member.WorkSpace.name.charAt(0)}
                  </WorkspacePlaceholder>
                }
              />
            ))}
        </ul>
      </nav>
      <Separator className="w-4/5" />
      {workspace.subscription?.plan === "FREE" && (
        <GlobalCard
          title="Upgrade To Pro"
          description="Unlock AI Features Like transcript , AI Summary and More"
        >
          <Button className="w-full text=sm mt-2">
            <Loader state={false}>Upgrade</Loader>
          </Button>
        </GlobalCard>
      )}
    </div>
  );
 

};

export default Sidebar;
