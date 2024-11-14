"use server";

import { client } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";

/**
 * verifyAccessToWorkspace
 * Purpose: Verify if the current user has access to a specific workspace
 * Parameters:
 * - workspaceId: string - ID of workspace to check
 * Flow:
 * 1. Get authenticated user
 * 2. Check if user is either owner or member of workspace
 * 3. Return access status
 */
export const verifyAccessToWorkspace = async (workspaceId: string) => {
  try {
    const user = await currentUser();
    if (!user) return { status: 403 }; // Forbidden if no authenticated user

    // Check workspace access using Prisma
    const isUserInWorkspace = await client.workSpace.findUnique({
      where: {
        id: workspaceId,
        OR: [
          {
            // Check if user is the workspace owner
            User: {
              clerkid: user.id,
            },
          },
          {
            // Check if user is a member of the workspace
            members: {
              every: {
                User: {
                  clerkid: user.id,
                },
              },
            },
          },
        ],
      },
    });

    return {
      status: 200,
      data: { workspace: isUserInWorkspace },
    };
  } catch (error) {
    console.log(error);
    return {
      status: 403,
      data: { workspace: null },
    };
  }
};

/**
 * getWorkspaceFolders
 * Purpose: Retrieve all folders in a workspace with video counts
 * Parameters:
 * - workSpaceId: string - ID of workspace to get folders from
 * Flow:
 * 1. Query folders for workspace
 * 2. Include count of videos in each folder
 * 3. Return folders if found
 */
export const getWorkspaceFolders = async (workSpaceId: string) => {
  try {
    // Find all folders in workspace
    const isFolders = await client.folder.findMany({
      where: {
        workSpaceId,
      },
      include: {
        _count: {
          select: {
            videos: true, // Include count of videos in each folder
          },
        },
      },
    });

    if (isFolders && isFolders.length > 0) {
      return { status: 200, data: isFolders };
    }
    return { status: 404, data: [] }; // No folders found
  } catch (error) {
    console.log(error);
    return { status: 500, data: [] }; // Server error
  }
};

/**
 * getAllUserVideos
 * Purpose: Get all videos in a workspace or folder
 * Parameters:
 * - workSpaceId: string - ID of workspace/folder to get videos from
 * Flow:
 * 1. Get authenticated user
 * 2. Query videos by workspace or folder ID
 * 3. Include related folder and user data
 * 4. Return sorted videos
 */
export const getAllUserVideos = async (workSpaceId: string) => {
  try {
    const user = await currentUser();
    if (!user) return { status: 404 };

    // Query videos with related data
    const videos = await client.video.findMany({
      where: {
        OR: [
          { workSpaceId }, // Videos in workspace
          { folderId: workSpaceId }, // Videos in specific folder
        ],
      },
      select: {
        id: true,
        title: true,
        createdAt: true,
        source: true,
        processing: true,
        Folder: {
          select: {
            id: true,
            name: true,
          },
        },
        User: {
          select: {
            firstname: true,
            lastname: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc", // Sort by creation date
      },
    });

    if (videos && videos.length > 0) {
      return { status: 200, data: videos };
    }
    return { status: 404, data: [] }; // No videos found
  } catch (error) {
    console.log(error);
    return { status: 400, data: [] };
  }
};

/**
 * getWorkSpaces
 * Purpose: Get all workspaces for current user (both owned and member of)
 * Flow:
 * 1. Get authenticated user
 * 2. Query user's workspaces and memberships
 * 3. Include subscription plan info
 * 4. Return workspace data
 */
export const getWorkSpaces = async () => {
  try {
    const user = await currentUser();
    if (!user) return { status: 404 };

    // Query user's workspaces and memberships
    const workspaces = await client.user.findUnique({
      where: {
        clerkid: user.id,
      },
      select: {
        subscription: {
          select: {
            plan: true, // Include subscription plan
          },
        },
        workspace: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
        members: {
          select: {
            WorkSpace: {
              select: {
                id: true,
                name: true,
                type: true,
              },
            },
          },
        },
      },
    });

    if (workspaces) {
      return { status: 200, data: workspaces };
    }
  } catch (error) {
    console.log(error);
    return { status: 400 };
  }
};
