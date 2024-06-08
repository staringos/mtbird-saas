import React from "react";
import { Button, Checkbox } from 'antd'
import styles from './style.module.less'
import Image from 'next/image'
import { useRouter } from "next/router";

export const Login = () => {
  const router = useRouter();

  const onChange = () => {
    
  }

  const onInstall = () => {
    router.push('/install')
  }

  return (
    <div className={styles.loginContainer}>
      <Image src={'https://mtbird-cdn.staringos.com/1vp4Kefd.png'} width={330} height={88} alt="logo" />
      <h1>欢迎使用星搭 MtBird 低代码平台</h1>
      <Checkbox onChange={onChange}>勾选即同意<a>《星搭MtBird 低代码平台使用协议》</a></Checkbox>
      <Button className={styles.install} type="primary" onClick={onInstall}>立即安装</Button>
    </div>
  )
}

export default Login;