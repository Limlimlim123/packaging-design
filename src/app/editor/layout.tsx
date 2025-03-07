export default function EditorLayout({
    children,
  }: {
    children: React.ReactNode
  }) {
    return (
      <div className="min-h-screen bg-gray-100">
        <header className="h-14 bg-white border-b fixed top-0 left-0 right-0 z-50">
          <div className="container mx-auto px-4 h-full flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="font-semibold">
                包装设计
              </Link>
              <span className="text-gray-300">|</span>
              <span className="text-sm text-gray-600">编辑器</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                保存
              </Button>
              <Button size="sm">
                预览
              </Button>
            </div>
          </div>
        </header>
        <main className="pt-14">
          {children}
        </main>
      </div>
    )
  }