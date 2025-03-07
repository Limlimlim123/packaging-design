'use client'

import { useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stage } from '@react-three/drei'
import * as THREE from 'three'

interface ThreeDPreviewProps {
  designImage: string
  boxDimensions: {
    width: number
    height: number
    depth: number
  }
  renderMode?: 'fiber' | 'vanilla' // 新增渲染模式选项
}

export function ThreeDPreview({ 
  designImage,
  boxDimensions,
  renderMode = 'fiber' // 默认使用 React Three Fiber
}: ThreeDPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  
  // 如果使用原生 Three.js 渲染
  if (renderMode === 'vanilla') {
    return (
      <VanillaThreePreview
        designImage={designImage}
        boxDimensions={boxDimensions}
      />
    )
  }

  // 使用 React Three Fiber 渲染
  return (
    <div className="w-full h-[400px] bg-gray-100 rounded-lg overflow-hidden">
      <Canvas shadows dpr={[1, 2]} camera={{ position: [4, 4, 4], fov: 50 }}>
        <Suspense fallback={null}>
          <Stage environment="city" intensity={0.6}>
            <Box
              width={boxDimensions.width}
              height={boxDimensions.height}
              depth={boxDimensions.depth}
              texture={designImage}
            />
          </Stage>
          <OrbitControls
            autoRotate
            autoRotateSpeed={2}
            enableZoom={true}
            enablePan={true}
            minDistance={3}
            maxDistance={8}
          />
        </Suspense>
      </Canvas>
    </div>
  )
}

// Box 组件 - React Three Fiber 实现
function Box({ width, height, depth, texture }: {
  width: number
  height: number
  depth: number
  texture: string
}) {
  const textureMap = useLoader(TextureLoader, texture)
  
  return (
    <mesh castShadow receiveShadow>
      <boxGeometry args={[width, height, depth]} />
      <meshStandardMaterial map={textureMap} />
    </mesh>
  )
}

// 原生 Three.js 实现
function VanillaThreePreview({ 
  designImage,
  boxDimensions 
}: {
  designImage: string
  boxDimensions: {
    width: number
    height: number
    depth: number
  }
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene>()
  const cameraRef = useRef<THREE.PerspectiveCamera>()
  const rendererRef = useRef<THREE.WebGLRenderer>()
  const boxRef = useRef<THREE.Mesh>()

  useEffect(() => {
    if (!containerRef.current) return

    // 初始化场景
    const scene = new THREE.Scene()
    sceneRef.current = scene
    scene.background = new THREE.Color(0xf5f5f5)

    // 设置相机
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    )
    cameraRef.current = camera
    camera.position.z = Math.max(
      boxDimensions.width,
      boxDimensions.height,
      boxDimensions.depth
    ) * 2

    // 设置渲染器
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    rendererRef.current = renderer
    renderer.setSize(
      containerRef.current.clientWidth,
      containerRef.current.clientHeight
    )
    renderer.shadowMap.enabled = true
    containerRef.current.appendChild(renderer.domElement)

    // 添加控制器
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05

    // 添加灯光
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(5, 5, 5)
    directionalLight.castShadow = true
    scene.add(directionalLight)

    // 加载纹理
    const textureLoader = new THREE.TextureLoader()
    const boxTexture = textureLoader.load(designImage)

    // 创建材质
    const materials = Array(6).fill(null).map(() => 
      new THREE.MeshStandardMaterial({ map: boxTexture })
    )

    // 创建盒子
    const geometry = new THREE.BoxGeometry(
      boxDimensions.width,
      boxDimensions.height,
      boxDimensions.depth
    )
    const box = new THREE.Mesh(geometry, materials)
    boxRef.current = box
    box.castShadow = true
    box.receiveShadow = true
    scene.add(box)

    // 动画循环
    const animate = () => {
      requestAnimationFrame(animate)
      controls.update()
      renderer.render(scene, camera)
    }
    animate()

    // 处理窗口大小变化
    const handleResize = () => {
      if (!containerRef.current) return
      
      const width = containerRef.current.clientWidth
      const height = containerRef.current.clientHeight

      if (cameraRef.current) {
        cameraRef.current.aspect = width / height
        cameraRef.current.updateProjectionMatrix()
      }

      if (rendererRef.current) {
        rendererRef.current.setSize(width, height)
      }
    }

    window.addEventListener('resize', handleResize)

    // 清理
    return () => {
      window.removeEventListener('resize', handleResize)
      containerRef.current?.removeChild(renderer.domElement)
      scene.remove(box)
      geometry.dispose()
      materials.forEach(material => material.dispose())
      renderer.dispose()
    }
  }, [boxDimensions, designImage])

  return (
    <div ref={containerRef} className="w-full h-full min-h-[400px]" />
  )
}