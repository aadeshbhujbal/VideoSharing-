"use server";

import { client } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";

/**
 * onAuthenticateUser
 * Purpose: Handles user authentication and database synchronization with Clerk
 * Flow:
 * 1. Get authenticated user from Clerk
 * 2. Check if user exists in our database
 * 3. If exists: return user data
 * 4. If not: create new user with default settings
 */
export const onAuthenticateUser = async () => {
  try {
    // Get the currently authenticated user from Clerk
    const user = await currentUser();
    if (!user) {
      return { status: 403 }; // Forbidden - No authenticated user
    }

    // Check if user exists in our database
    const userExists = await client.user.findUnique({
      where: {
        clerkid: user.id, // Use Clerk's ID as unique identifier
      },
      include: {
        // Include related workspace data where user is a member
        workspace: {
          where: {
            User: {
              clerkid: user.id,
            },
          },
        },
      },
    });

    // If user exists, return their data
    if (userExists) {
      return { status: 200, user: userExists };
    }

    // If user doesn't exist, create new user with default settings
    const newUser = await client.user.create({
      data: {
        // Basic user information from Clerk
        clerkid: user.id,
        email: user.emailAddresses[0].emailAddress,
        firstname: user.firstName,
        lastname: user.lastName,
        image: user.imageUrl,
        
        // Create default studio (empty object as default settings)
        studio: {
          create: {},
        },
        
        // Create default subscription (empty object as default settings)
        subscription: {
          create: {},
        },
        
        // Create default personal workspace
        workspace: {
          create: {
            name: `${user.firstName}'s Workspace`,
            type: "PERSONAL",
          },
        },
      },
      // Include related data in response
      include: {
        workspace: {
          where: {
            User: {
              clerkid: user.id,
            },
          },
        },
        subscription: {
          select: {
            plan: true,
          },
        },
      },
    });

    // Return newly created user
    if (newUser) {
      return { status: 201, user: newUser }; // 201: Created
    }
    return { status: 400 }; // Bad Request if user creation failed
  } catch (error) {
    return { status: 500 }; // Internal Server Error
  }
};

/**
 * getNotifications
 * Purpose: Retrieves user notifications and their count
 * Flow:
 * 1. Get authenticated user
 * 2. Query database for user's notifications
 * 3. Return notifications with count if they exist
 */
export const getNotifications = async () => {
  try {
    const user = await currentUser();
    if (!user) return { status: 404 }; // Not Found - No user

    // Query for notifications
    const notifications = await client.user.findUnique({
      where: {
        clerkid: user.id,
      },
      select: {
        notification: true, // Get all notifications
        _count: {
          select: {
            notification: true, // Get total count of notifications
          },
        },
      },
    });

    // Return notifications if they exist
    if (notifications && notifications.notification.length > 0) {
      return { status: 200, data: notifications };
    }
    return { status: 404, data: [] }; // No notifications found
  } catch (error) {
    console.log(error);
    return { status: 400 }; // Bad Request
  }
};

/**
 * searchUsers
 * Purpose: Search for users based on a query string
 * Parameters:
 * - query: string to search for in user fields
 * Flow:
 * 1. Get authenticated user
 * 2. Search database for users matching query
 * 3. Return matching users excluding current user
 */
export const searchUsers = async (query: string) => {
  try {
    const user = await currentUser();
    if (!user) return { status: 404 };

    // Search for users
    const users = await client.user.findMany({
      where: {
        OR: [
          // Search in multiple fields
          { firstname: { contains: query } },
          { email: { contains: query } },
          { lastname: { contains: query } }
        ],
        NOT: [
          { clerkid: user.id } // Exclude current user from results
        ],
      },
      select: {
        // Select only necessary fields
        id: true,
        subscription: {
          select: { plan: true }
        },
        firstname: true,
        lastname: true,
        image: true,
        email: true
      }
    });

    // Return results if users found
    if (users && users.length > 0) {
      return { status: 200, data: users };
    }
    return { status: 404, data: undefined }; // No users found
  } catch (error) {
    console.log(error);
    return { status: 400, data: undefined }; // Bad Request
  }
};
