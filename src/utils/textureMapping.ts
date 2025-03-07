import * as THREE from 'three'

export function createBoxTexture(
  frontImage: string,
  backImage?: string,
  topImage?: string,
  bottomImage?: string,
  leftImage?: string,
  rightImage?: string
) {
  const loader = new THREE.TextureLoader()
  const materials = [
    new THREE.MeshStandardMaterial({ map: loader.load(rightImage || frontImage) }),
    new THREE.MeshStandardMaterial({ map: loader.load(leftImage || frontImage) }),
    new THREE.MeshStandardMaterial({ map: loader.load(topImage || frontImage) }),
    new THREE.MeshStandardMaterial({ map: loader.load(bottomImage || frontImage) }),
    new THREE.MeshStandardMaterial({ map: loader.load(frontImage) }),
    new THREE.MeshStandardMaterial({ map: loader.load(backImage || frontImage) })
  ]

  return materials
}