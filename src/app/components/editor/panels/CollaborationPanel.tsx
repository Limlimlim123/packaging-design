'use client'

import { useCallback, useEffect, useState } from 'react'
import { useEditorStore } from '@/store/editor/editorStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useToast } from '@/components/ui/use-toast'
import {
    Users,
    UserPlus,
    MessageSquare,
    Send,
    Crown,
    HandPointing,
    UserX,
    Settings,
    Lock,
    Unlock
} from 'lucide-react'

interface Collaborator {
    id: string
    name: string
    email: string
    avatar: string
    role: 'owner' | 'editor' | 'viewer'
    online: boolean
    lastSeen?: string
    cursor?: {
        x: number
        y: number
    }
}

interface Message {
    id: string
    userId: string
    content: string
    timestamp: string
}

export function CollaborationPanel() {
    const { canvas } = useEditorStore()
    const { toast } = useToast()
    const [collaborators, setCollaborators] = useState<Collaborator[]>([])
    const [messages, setMessages] = useState<Message[]>([])
    const [newMessage, setNewMessage] = useState('')
    const [inviteEmail, setInviteEmail] = useState('')
    const [loading, setLoading] = useState(false)

    // 模拟实时协作连接
    useEffect(() => {
        const connect = async () => {
            try {
                // 这里应该是实际的WebSocket连接逻辑
                const ws = new WebSocket('ws://your-collaboration-server')

                ws.onmessage = (event) => {
                    const data = JSON.parse(event.data)
                    switch (data.type) {
                        case 'collaborator_joined':
                            setCollaborators(prev => [...prev, data.collaborator])
                            break
                        case 'collaborator_left':
                            setCollaborators(prev => 
                                prev.filter(c => c.id !== data.collaboratorId)
                            )
                            break
                        case 'cursor_moved':
                            setCollaborators(prev => 
                                prev.map(c => 
                                    c.id === data.collaboratorId 
                                        ? { ...c, cursor: data.cursor }
                                        : c
                                )
                            )
                            break
                        case 'new_message':
                            setMessages(prev => [...prev, data.message])
                            break
                    }
                }

                return () => ws.close()
            } catch (error) {
                console.error('Collaboration connection failed:', error)
                toast({
                    title: "连接失败",
                    description: "无法连接到协作服务器",
                    variant: "destructive"
                })
            }
        }

        connect()
    }, [])

    const inviteCollaborator = useCallback(async () => {
        if (!inviteEmail) return

        setLoading(true)
        try {
            // 这里应该是实际的邀请逻辑
            await fetch('/api/collaborate/invite', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: inviteEmail
                })
            })

            toast({
                title: "邀请已发送",
                description: `邀请已发送至 ${inviteEmail}`
            })
            setInviteEmail('')
        } catch (error) {
            console.error('Invite failed:', error)
            toast({
                title: "邀请失败",
                description: "无法发送邀请，请重试",
                variant: "destructive"
            })
        } finally {
            setLoading(false)
        }
    }, [inviteEmail])

    const sendMessage = useCallback(() => {
        if (!newMessage.trim()) return

        const message: Message = {
            id: Date.now().toString(),
            userId: 'current-user-id', // 应该从用户会话中获取
            content: newMessage,
            timestamp: new Date().toISOString()
        }

        setMessages(prev => [...prev, message])
        setNewMessage('')

        // 这里应该发送消息到服务器
    }, [newMessage])

    const removeCollaborator = useCallback((collaboratorId: string) => {
        setCollaborators(prev => prev.filter(c => c.id !== collaboratorId))
        // 这里应该发送移除请求到服务器
    }, [])

    const changeRole = useCallback((collaboratorId: string, newRole: 'editor' | 'viewer') => {
        setCollaborators(prev => 
            prev.map(c => 
                c.id === collaboratorId 
                    ? { ...c, role: newRole }
                    : c
            )
        )
        // 这里应该发送角色更改请求到服务器
    }, [])

    return (
        <div className="p-4 space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    协作
                </h3>
            </div>

            <div className="space-y-4">
                <div className="flex items-center space-x-2">
                    <Input
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        placeholder="输入邮箱邀请协作者"
                    />
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={inviteCollaborator}
                        disabled={loading || !inviteEmail}
                    >
                        <UserPlus className="h-4 w-4" />
                    </Button>
                </div>

                <ScrollArea className="h-[200px]">
                    <div className="space-y-2">
                        {collaborators.map(collaborator => (
                            <div
                                key={collaborator.id}
                                className="flex items-center justify-between p-2 rounded-lg hover:bg-accent"
                            >
                                <div className="flex items-center space-x-2">
                                    <Avatar>
                                        <AvatarImage src={collaborator.avatar} />
                                        <AvatarFallback>
                                            {collaborator.name[0]}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="flex items-center space-x-2">
                                            <span className="font-medium">
                                                {collaborator.name}
                                            </span>
                                            {collaborator.role === 'owner' && (
                                                <Crown className="h-4 w-4 text-yellow-400" />
                                            )}
                                            <Badge
                                                variant={collaborator.online ? 'default' : 'secondary'}
                                            >
                                                {collaborator.online ? '在线' : '离线'}
                                            </Badge>
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {collaborator.email}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => 
                                            changeRole(
                                                collaborator.id,
                                                collaborator.role === 'editor' ? 'viewer' : 'editor'
                                            )
                                        }
                                    >
                                        {collaborator.role === 'editor' ? (
                                            <Lock className="h-4 w-4" />
                                        ) : (
                                            <Unlock className="h-4 w-4" />
                                        )}
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeCollaborator(collaborator.id)}
                                        className="text-red-500 hover:text-red-600"
                                    >
                                        <UserX className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>

                <div className="space-y-2">
                    <div className="flex items-center">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        <span className="text-sm font-medium">聊天</span>
                    </div>
                    <ScrollArea className="h-[200px] border rounded-lg p-2">
                        <div className="space-y-2">
                            {messages.map(message => {
                                const sender = collaborators.find(c => c.id === message.userId)
                                return (
                                    <div
                                        key={message.id}
                                        className="flex items-start space-x-2"
                                    >
                                        <Avatar className="h-6 w-6">
                                            <AvatarImage src={sender?.avatar} />
                                            <AvatarFallback>
                                                {sender?.name[0]}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="flex items-center space-x-2">
                                                <span className="text-sm font-medium">
                                                    {sender?.name}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    {new Date(message.timestamp).toLocaleTimeString()}
                                                </span>
                                            </div>
                                            <p className="text-sm">
                                                {message.content}
                                            </p>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </ScrollArea>
                    <div className="flex items-center space-x-2">
                        <Input
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="输入消息..."
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    sendMessage()
                                }
                            }}
                        />
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={sendMessage}
                            disabled={!newMessage.trim()}
                        >
                            <Send className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}