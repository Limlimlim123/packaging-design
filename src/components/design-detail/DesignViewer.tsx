// 3D预览组件
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'

export function DesignViewer({ modelUrl }: { modelUrl: string }) {
  return (
    <div className="w-full aspect-square">
      <Canvas>
        <OrbitControls />
        {/* 3D模型加载 */}
      </Canvas>
    </div>
  )
}