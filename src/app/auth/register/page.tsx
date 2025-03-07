import { AuthForm } from '@/components/auth/AuthForm'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'

export default async function RegisterPage() {
    // 检查用户是否已登录
    const session = await getServerSession()
    if (session) {
        redirect('/dashboard')
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md">
                <AuthForm mode="register" />
            </div>
        </div>
    )
}