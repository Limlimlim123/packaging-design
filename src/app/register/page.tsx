'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    phone: '',
    password: '',
    confirmPassword: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.password !== formData.confirmPassword) {
      alert('两次输入的密码不一致')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: formData.phone,
          password: formData.password
        }),
      })

      if (response.ok) {
        router.push('/login')
      } else {
        const data = await response.json()
        alert(data.message || '注册失败')
      }
    } catch (err) {
      alert('注册失败，请稍后重试')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <div>
      <h1>注册新账号</h1>
      
      <form onSubmit={handleSubmit}>
        <div>
          <input
            name="phone"
            type="tel"
            required
            placeholder="手机号"
            value={formData.phone}
            onChange={handleChange}
          />
        </div>

        <div>
          <input
            name="password"
            type="password"
            required
            placeholder="密码"
            value={formData.password}
            onChange={handleChange}
          />
        </div>

        <div>
          <input
            name="confirmPassword"
            type="password"
            required
            placeholder="确认密码"
            value={formData.confirmPassword}
            onChange={handleChange}
          />
        </div>

        <button type="submit" disabled={isLoading}>
          {isLoading ? '注册中...' : '注册'}
        </button>

        <div>
          <Link href="/login">返回登录</Link>
        </div>
      </form>
    </div>
  )
}