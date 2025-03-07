import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function auth() {
  const session = await getServerSession(authOptions)
  return session
}

export async function verifyAuth() {
  const session = await auth()
  if (!session) {
    throw new Error('Unauthorized')
  }
  return session
}