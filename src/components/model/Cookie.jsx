import React, { useRef } from 'react'
import { useGLTF } from '@react-three/drei'

export function Model(props) {
    const { nodes, materials } = useGLTF('/models/cookie_school_project.glb')
    return (
        <group {...props} dispose={null}>
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.pCylinder15_lambert12_0.geometry}
                material={materials.lambert12}
            />
        </group>
    )
}

useGLTF.preload('/models/cookie_school_project.glb')