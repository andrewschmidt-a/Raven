import { useCallback, useContext } from "react"
import { ChannelDetails } from "../channel-details/ChannelDetails"
import { ChannelMemberDetails } from "../channel-member-details/ChannelMemberDetails"
import { FilesSharedInChannel } from '../channel-shared-files/FilesSharedInChannel'
import { ChannelSettings } from "../channel-settings/ChannelSettings"
import { UserContext } from "../../../utils/auth/UserProvider"
import { ChannelIcon } from "@/utils/layout/channelIcon"
import { ChannelListItem } from "@/utils/channel/ChannelListProvider"
import { Box, Dialog, Flex, Tabs, Text } from "@radix-ui/themes"
import { DIALOG_CONTENT_CLASS } from "@/utils/layout/dialog"
import useFetchChannelMembers from "@/hooks/fetchers/useFetchChannelMembers"
import useFetchActiveUsers from "@/hooks/fetchers/useFetchActiveUsers"

interface ViewChannelDetailsModalContentProps {
    open: boolean,
    setOpen: (open: boolean) => void
    channelData: ChannelListItem,

}

const ViewChannelDetailsModal = ({ open, setOpen, channelData }: ViewChannelDetailsModalContentProps) => {

    return (
        <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Content className={DIALOG_CONTENT_CLASS}>
                <ViewChannelDetailsModalContent open={open} setOpen={setOpen} channelData={channelData} />
            </Dialog.Content>
        </Dialog.Root>
    )
}

export default ViewChannelDetailsModal

const ViewChannelDetailsModalContent = ({ setOpen, channelData }: ViewChannelDetailsModalContentProps) => {

    const { data } = useFetchActiveUsers()

    const activeUsers = data?.message ?? []

    const { channelMembers, mutate: updateMembers } = useFetchChannelMembers(channelData.name)

    const memberCount = Object.keys(channelMembers).length
    const { currentUser } = useContext(UserContext)
    const type = channelData.type

    const onClose = useCallback(() => {
        setOpen(false)
    }, [setOpen])

    return (
        <>
            <Dialog.Title>
                <Flex align='center' gap='2'>
                    <ChannelIcon className={'mt-1'} type={type} />
                    <Text>{channelData.channel_name}</Text>
                </Flex>
            </Dialog.Title>

            <Tabs.Root defaultValue="About">
                <Flex direction={'column'} gap='4'>
                    <Tabs.List>
                        <Tabs.Trigger value="About">About</Tabs.Trigger>
                        <Tabs.Trigger value="Members">
                            <Flex gap='2'>
                                <Text>Members</Text>
                                <Text>{memberCount}</Text>
                            </Flex>
                        </Tabs.Trigger>
                        <Tabs.Trigger value="Files">Files</Tabs.Trigger>
                        {/* channel settings are only available for admins */}
                        {/* the general channel is the default channel and cannot be deleted or archived */}
                        {channelMembers[currentUser]?.is_admin == 1 && channelData.name != 'general' && channelData.is_archived == 0 && <Tabs.Trigger value="Settings">Settings</Tabs.Trigger>}
                    </Tabs.List>
                    <Box>
                        <Tabs.Content value="About">
                            <ChannelDetails channelData={channelData} channelMembers={channelMembers} onClose={onClose} />
                        </Tabs.Content>
                        <Tabs.Content value="Members">
                            <ChannelMemberDetails channelData={channelData} channelMembers={channelMembers} activeUsers={activeUsers} updateMembers={updateMembers} />
                        </Tabs.Content>
                        <Tabs.Content value="Files">
                            <FilesSharedInChannel channelMembers={channelMembers} />
                        </Tabs.Content>
                        <Tabs.Content value="Settings">
                            <ChannelSettings channelData={channelData} onClose={onClose} />
                        </Tabs.Content>
                    </Box>
                </Flex>
            </Tabs.Root>
        </>
    )
}