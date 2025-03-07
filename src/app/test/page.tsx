'use client'

import React from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

const TestPage = () => {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-8">组件测试页面</h1>
      
      {/* 按钮测试 */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">按钮组件</h2>
        <div className="flex gap-4 flex-wrap">
          <Button variant="default">默认按钮</Button>
          <Button variant="primary">主要按钮</Button>
          <Button variant="outline">边框按钮</Button>
          <Button loading>加载中</Button>
        </div>
      </section>

      {/* 输入框测试 */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">输入框组件</h2>
        <Input placeholder="请输入内容..." className="max-w-xs" />
      </section>

      {/* 选择框测试 */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">选择框组件</h2>
        <Select>
          <SelectTrigger className="max-w-xs">
            <SelectValue placeholder="请选择..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">选项一</SelectItem>
            <SelectItem value="2">选项二</SelectItem>
            <SelectItem value="3">选项三</SelectItem>
          </SelectContent>
        </Select>
      </section>

      {/* 加载动画测试 */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">加载动画</h2>
        <div className="flex items-center gap-4">
          <LoadingSpinner size="sm" />
          <LoadingSpinner size="md" />
          <LoadingSpinner size="lg" />
        </div>
      </section>

      {/* 标签页测试 */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">标签页组件</h2>
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">标签一</TabsTrigger>
            <TabsTrigger value="tab2">标签二</TabsTrigger>
            <TabsTrigger value="tab3">标签三</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">
            <div className="p-4 bg-white rounded-lg">标签一的内容</div>
          </TabsContent>
          <TabsContent value="tab2">
            <div className="p-4 bg-white rounded-lg">标签二的内容</div>
          </TabsContent>
          <TabsContent value="tab3">
            <div className="p-4 bg-white rounded-lg">标签三的内容</div>
          </TabsContent>
        </Tabs>
      </section>
    </div>
  )
}

export default TestPage
