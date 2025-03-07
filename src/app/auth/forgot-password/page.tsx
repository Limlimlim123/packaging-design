'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('')
    const [phone, setPhone] = useState('')
    const [method, setMethod] = useState<'email' | 'phone'>('email')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    method,
                    email: method === 'email' ? email : undefined,
                    phone: method === 'phone' ? phone : undefined,
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error)
            }

            setSuccess(true)
        } catch (err) {
            setError(err instanceof Error ? err.message : '操作失败')
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8 text-center">
                    <h2 className="text-2xl font-bold">重置链接已发送</h2>
                    <p className="text-gray-600">
                        {method === 'email' 
                            ? '请检查您的邮箱，按照邮件中的说明重置密码。'
                            : '请查看手机短信，输入验证码重置密码。'
                        }
                    </p>
                    <Link
                        href="/auth/login"
                        className="text-blue-600 hover:text-blue-500"
                    >
                        返回登录
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="text-center text-2xl font-bold">找回密码</h2>
                    <p className="mt-2 text-center text-gray-600">
                        选择找回密码的方式
                    </p>
                </div>

                <div className="flex justify-center space-x-4">
                    <button
                        onClick={() => setMethod('email')}
                        className={`px-4 py-2 rounded-md ${
                            method === 'email'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-gray-100 text-gray-700'
                        }`}
                    >
                        邮箱找回
                    </button>
                    <button
                        onClick={() => setMethod('phone')}
                        className={`px-4 py-2 rounded-md ${
                            method === 'phone'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-gray-100 text-gray-700'
                        }`}
                    >
                        手机找回
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                    {method === 'email' ? (
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                邮箱地址
                            </label>
                            <input
                                id="email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                placeholder="请输入注册时使用的邮箱"
                            />
                        </div>
                    ) : (
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                                手机号码
                            </label>
                            <input
                                id="phone"
                                type="tel"
                                required
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                placeholder="请输入注册时使用的手机号"
                            />
                        </div>
                    )}

                    {error && (
                        <div className="text-red-500 text-sm text-center">
                            {error}
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                            {loading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                '发送重置链接'
                            )}
                        </button>
                    </div>

                    <div className="text-center">
                        <Link
                            href="/auth/login"
                            className="text-sm text-blue-600 hover:text-blue-500"
                        >
                            返回登录
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    )
}