'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { useToast } from '@/components/ui/use-toast'
import { MessageSquare, Check, X, MoreVertical, Loader2 } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'

interface Comment {
    id: string
    content: string
    resolved: boolean
    user: {
        id: string
        name: string
        avatar: string | null
    }
    createdAt: string
    replies: Comment[]
}

interface CommentPanelProps {
    designId: string
}

export function CommentPanel({ designId }: CommentPanelProps) {
    const [comments, setComments] = useState<Comment[]>([])
    const [loading, setLoading] = useState(true)
    const [content, setContent] = useState('')
    const [replyTo, setReplyTo] = useState<string | null>(null)
    const [submitting, setSubmitting] = useState(false)
    const { data: session } = useSession()
    const { toast } = useToast()
    const scrollRef = useRef<HTMLDivElement>(null)

    // 加载评论
    useEffect(() => {
        const loadComments = async () => {
            try {
                const response = await fetch(`/api/designs/${designId}/comments`)
                const data = await response.json()
                
                if (!response.ok) {
                    throw new Error(data.error)
                }

                setComments(data)
            } catch (error) {
                toast({
                    title: '错误',
                    description: '加载评论失败',
                    variant: 'destructive'
                })
            } finally {
                setLoading(false)
            }
        }

        loadComments()
        // 设置实时更新
        const eventSource = new EventSource(`/api/designs/${designId}/comments/stream`)
        
        eventSource.onmessage = (event) => {
            const comment = JSON.parse(event.data)
            setComments(prev => {
                if (comment.parentId) {
                    return prev.map(c => {
                        if (c.id === comment.parentId) {
                            return { ...c, replies: [...c.replies, comment] }
                        }
                        return c
                    })
                }
                return [...prev, comment]
            })
            scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
        }

        return () => {
            eventSource.close()
        }
    }, [designId, toast])

    // 提交评论
    const handleSubmit = async () => {
        if (!content.trim() || !session?.user) return

        setSubmitting(true)
        try {
            const response = await fetch(`/api/designs/${designId}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    content,
                    parentId: replyTo
                }),
            })

            if (!response.ok) {
                throw new Error('提交失败')
            }

            setContent('')
            setReplyTo(null)
        } catch (error) {
            toast({
                title: '错误',
                description: '提交评论失败',
                variant: 'destructive'
            })
        } finally {
            setSubmitting(false)
        }
    }

    // 解决评论
    const handleResolve = async (commentId: string) => {
        try {
            const response = await fetch(`/api/designs/${designId}/comments/${commentId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    resolved: true
                }),
            })

            if (!response.ok) {
                throw new Error('操作失败')
            }

            setComments(prev => prev.map(c => 
                c.id === commentId ? { ...c, resolved: true } : c
            ))
        } catch (error) {
            toast({
                title: '错误',
                description: '操作失败',
                variant: 'destructive'
            })
        }
    }

    // 删除评论
    const handleDelete = async (commentId: string) => {
        try {
            const response = await fetch(`/api/designs/${designId}/comments/${commentId}`, {
                method: 'DELETE'
            })

            if (!response.ok) {
                throw new Error('删除失败')
            }

            setComments(prev => prev.filter(c => c.id !== commentId))
        } catch (error) {
            toast({
                title: '错误',
                description: '删除失败',
                variant: 'destructive'
            })
        }
    }

    return (
        <div className="h-full flex flex-col">
            <div className="p-4 border-b">
                <h3 className="font-medium flex items-center space-x-2">
                    <MessageSquare className="h-5 w-5" />
                    <span>评论</span>
                </h3>
            </div>

            <ScrollArea ref={scrollRef} className="flex-1">
                <div className="p-4 space-y-6">
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                        </div>
                    ) : comments.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            暂无评论
                        </div>
                    ) : (
                        comments.map(comment => (
                            <div key={comment.id} className="space-y-4">
                                {/* 主评论 */}
                                <div className={`
                                    rounded-lg p-4
                                    ${comment.resolved ? 'bg-gray-50' : 'bg-white border'}
                                `}>
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start space-x-3">
                                            <Avatar>
                                                <AvatarImage src={comment.user.avatar || undefined} />
                                                <AvatarFallback>
                                                    {comment.user.name[0]}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="font-medium">
                                                    {comment.user.name}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {formatDistanceToNow(new Date(comment.createdAt), {
                                                        addSuffix: true,
                                                        locale: zhCN
                                                    })}
                                                </div>
                                                <div className="mt-2">
                                                    {comment.content}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center space-x-2">
                                            {!comment.resolved && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleResolve(comment.id)}
                                                    title="标记为已解决"
                                                >
                                                    <Check className="h-4 w-4" />
                                                </Button>
                                            )}
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
                                                        onClick={() => setReplyTo(comment.id)}
                                                    >
                                                        回复
                                                    </DropdownMenuItem>
                                                    {session?.user?.id === comment.user.id && (
                                                        <DropdownMenuItem
                                                            className="text-red-600"
                                                            onClick={() => handleDelete(comment.id)}
                                                        >
                                                            删除
                                                        </DropdownMenuItem>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>

                                    {/* 回复列表 */}
                                    {comment.replies.length > 0 && (
                                        <div className="mt-4 pl-8 space-y-4">
                                            {comment.replies.map(reply => (
                                                <div
                                                    key={reply.id}
                                                    className="flex items-start space-x-3"
                                                >
                                                    <Avatar className="h-8 w-8">
                                                        <AvatarImage src={reply.user.avatar || undefined} />
                                                        <AvatarFallback>
                                                            {reply.user.name[0]}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <div className="font-medium text-sm">
                                                            {reply.user.name}
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            {formatDistanceToNow(new Date(reply.createdAt), {
                                                                addSuffix: true,
                                                                locale: zhCN
                                                            })}
                                                        </div>
                                                        <div className="mt-1 text-sm">
                                                            {reply.content}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </ScrollArea>

            {/* 评论输入框 */}
            <div className="p-4 border-t">
                {replyTo && (
                    <div className="mb-2 flex items-center justify-between text-sm text-gray-500">
                        <span>回复评论</span>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setReplyTo(null)}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                )}
                <div className="space-y-2">
                    <Textarea
                        value={content}
                        onChange={e => setContent(e.target.value)}
                        placeholder="写下你的评论..."
                        rows={3}
                    />
                    <div className="flex justify-end">
                        <Button
                            onClick={handleSubmit}
                            disabled={!content.trim() || submitting}
                        >
                            {submitting ? '提交中...' : '发表评论'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}