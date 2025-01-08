"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export const syncUser = async () => {
  try {
    //get user id from clerk
    const { userId } = await auth();
    const user = await currentUser();
    //check if there is no user id
    if (!userId || !user) {
      return;
    }

    //check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    });
    //Then return the existing user
    if (existingUser) {
      return existingUser;
    }
    //Otherwise create  user
    //create user
    const dbUser = await prisma.user.create({
      data: {
        clerkId: userId,
        name: `${user.firstName || ""} ${user.lastName || ""}`,
        username:
          user.username ?? user.emailAddresses[0].emailAddress.split("@")[0],

        // If user does not have a username, we can use their email address to create a username
        email: user.emailAddresses[0].emailAddress,
        image: user.imageUrl,
      },
    });

    return dbUser;
  } catch (error) {
    console.log(error);
  }
};

export const getUserByClerkId = async (clerkId: string) => {
  return await prisma.user.findUnique({
    where: {
      clerkId,
    },
    include: {
      _count: {
        select: {
          followers: true,
          following: true,
          posts: true,
        },
      },
    },
  });
};

