// Copyright 2023 Datav.io Team
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { Box, Heading, HStack, Text, useColorModeValue } from "@chakra-ui/react"
import PageContainer from "layouts/PageContainer"
import customColors from "src/theme/colors"
import { Route } from "types/route"
import React from "react"
import { Link } from "react-router-dom"
import { useStore } from "@nanostores/react"
import { commonMsg, navigateMsg } from "src/i18n/locales/en"

interface Props {
    title: string
    subTitle?: string
    icon?: any
    children: React.ReactNode
    tabs?: Route[]
}

const Page = (props: Props) => {
    const t = useStore(commonMsg)  
    const t1 = useStore(navigateMsg)
    const { title, subTitle, icon, children, tabs } = props

    const borderColor = useColorModeValue(customColors.borderColor.light, customColors.borderColor.dark)
    const border = `1px solid ${borderColor}`

    const activeTab = tabs?.find(tab => tab.url === window.location.pathname)
    return (<>
        <Box width="100%">
            <HStack spacing="4" px="12" pt="10" pb="10">
                <Box fontSize="40px">{icon}</Box>
                <Box>
                    <Box textStyle="mainTitle">{title}</Box>
                    <Text mt="1" ml="1">{subTitle}</Text>
                </Box>


            </HStack>
            <HStack px="12" spacing="8" borderBottom={border} >
                {tabs?.map((tab, index) => {
                    return <Link to={tab.url} key={index} > 
                    <HStack spacing="2" borderLeft={tab.url == activeTab.url ? border: null} borderRight={tab.url == activeTab.url ? border: null} cursor="pointer">
                        <Box className={ tab.url == activeTab.url ? "top-gradient-border" : null} >
                            <HStack py="2" px="4" >
                                {tab.icon}
                                <Text>{t[tab.title] ?? t1[tab.title]}</Text>
                            </HStack>
                        </Box>
                    </HStack>
                    </Link>
                })}
            </HStack>

            <Box mt="8" px="12">
                {children}
            </Box>
        </Box>
        </>)
}

export default Page