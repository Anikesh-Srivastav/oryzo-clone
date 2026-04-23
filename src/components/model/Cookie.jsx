import React, { useRef } from 'react'
import { useGLTF } from '@react-three/drei'

const COOKIE_MODEL_URL = '/models/cookie_school_project.v1.glb'

export function Model(props) {
    const { nodes, materials } = useGLTF(COOKIE_MODEL_URL)
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

useGLTF.preload(COOKIE_MODEL_URL)
