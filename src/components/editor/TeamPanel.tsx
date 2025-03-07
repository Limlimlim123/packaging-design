'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { useToast } from '@/components/ui/use-toast'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Users, UserPlus, MoreVertical, Crown, Shield, User as UserIcon, Loader2 } from 'lucide-react'

interface TeamMember {
    id: string
    role: 'owner' | 'admin' | 'member'
    user: {
        id: string
        name: string
        email: string
        avatar: string | null
    }
}

interface TeamPanelProps {
    designId: string
    teamId: string | null
    onTeamChange: () => void
}

export function TeamPanel({ designId, teamId, onTeamChange }: TeamPanelProps) {
    const [members, setMembers] = useState<TeamMember[]>([])
    const [loading, setLoading] = useState(true)
    const [inviteEmail, setInviteEmail] = useState('')
    const [inviting, setInviting] = useState(false)
    const { toast } = useToast()

    // 加载团队成员
    useEffect(() => {
        const loadMembers = async () => {
            if (!teamId) {
                setLoading(false)
                return
            }

            try {
                const response = await fetch(`/api/teams/${teamId}/members`)
                const data = await response.json()
                
                if (!response.ok) {
                    throw new Error(data.error)
                }

                setMembers(data)
            } catch (error) {
                toast({
                    title: '错误',
                    description: '加载团队成员失败',
                    variant: 'destructive'
                })
            } finally {
                setLoading(false)
            }
        }

        loadMembers()
    }, [teamId, toast])

    // 邀请成员
    const handleInvite = async () => {
        if (!teamId || !inviteEmail.trim()) return

        setInviting(true)
        try {
            const response = await fetch(`/api/teams/${teamId}/invite`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: inviteEmail,
                    designId
                }),
            })

            if (!response.ok) {
                throw new Error('邀请失败')
            }

            toast({
                description: '邀请已发送'
            })
            setInviteEmail('')
        } catch (error) {
            toast({
                title: '错误',
                description: '邀请失败',
                variant: 'destructive'
            })
        } finally {
            setInviting(false)
        }
    }

    // 更改成员角色
    const handleRoleChange = async (memberId: string, newRole: string) => {
        if (!teamId) return

        try {
            const response = await fetch(`/api/teams/${teamId}/members/${memberId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    role: newRole
                }),
            })

            if (!response.ok) {
                throw new Error('更改失败')
            }

            setMembers(prev => prev.map(member => 
                member.id === memberId ? { ...member, role: newRole as 'owner' | 'admin' | 'member' } : member
            ))

            toast({
                description: '角色已更新'
            })
        } catch (error) {
            toast({
                title: '错误',
                description: '更改角色失败',
                variant: 'destructive'
            })
        }
    }

    // 移除成员
    const handleRemove = async (memberId: string) => {
        if (!teamId) return

        try {
            const response = await fetch(`/api/teams/${teamId}/members/${memberId}`, {
                method: 'DELETE'
            })

            if (!response.ok) {
                throw new Error('移除失败')
            }

            setMembers(prev => prev.filter(member => member.id !== memberId))
            toast({
                description: '成员已移除'
            })
        } catch (error) {
            toast({
                title: '错误',
                description: '移除成员失败',
                variant: 'destructive'
            })
        }
    }

    const getRoleIcon = (role: string) => {
        switch (role) {
            case 'owner':
                return <Crown className="h-4 w-4 text-yellow-500" />
            case 'admin':
                return <Shield className="h-4 w-4 text-blue-500" />
            default:
                return <UserIcon className="h-4 w-4 text-gray-500" />
        }
    }

    return (
        <div className="h-full flex flex-col">
            <div className="p-4 border-b">
                <h3 className="font-medium flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>团队协作</span>
                </h3>
            </div>

            <ScrollArea className="flex-1">
                <div className="p-4">
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                        </div>
                    ) : !teamId ? (
                        <div className="text-center py-8">
                            <p className="text-gray-500 mb-4">这是个人设计</p>
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button>创建团队</Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>创建新团队</DialogTitle>
                                    </DialogHeader>
                                    {/* 团队创建表单 */}
                                </DialogContent>
                            </Dialog>
                        </div>
                    ) : (
                        <>
                            {/* 邀请成员 */}
                            <div className="mb-6">
                                <div className="flex space-x-2">
                                    <Input
                                        value={inviteEmail}
                                        onChange={e => setInviteEmail(e.target.value)}
                                        placeholder="输入邮箱邀请成员"
                                        type="email"
                                    />
                                    <Button
                                        onClick={handleInvite}
                                        disabled={!inviteEmail.trim() || inviting}
                                    >
                                        <UserPlus className="h-4 w-4 mr-2" />
                                        邀请
                                    </Button>
                                </div>
                            </div>

                            {/* 成员列表 */}
                            <div className="space-y-4">
                                {members.map(member => (
                                    <div
                                        key={member.id}
                                        className="flex items-center justify-between"
                                    >
                                        <div className="flex items-center space-x-3">
                                            <Avatar>
                                                <AvatarImage src={member.user.avatar || undefined} />
                                                <AvatarFallback>
                                                    {member.user.name[0]}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="font-medium flex items-center space-x-2">
                                                    <span>{member.user.name}</span>
                                                    {getRoleIcon(member.role)}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {member.user.email}
                                                </div>
                                            </div>
                                        </div>

                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                >
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem
                                                    onClick={() => handleRoleChange(member.id, 'admin')}
                                                    disabled={member.role === 'owner'}
                                                >
                                                    设为管理员
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => handleRoleChange(member.id, 'member')}
                                                    disabled={member.role === 'owner'}
                                                >
                                                    设为普通成员
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="text-red-600"
                                                    onClick={() => handleRemove(member.id)}
                                                    disabled={member.role === 'owner'}
                                                >
                                                    移除成员
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </ScrollArea>
        </div>
    )
}