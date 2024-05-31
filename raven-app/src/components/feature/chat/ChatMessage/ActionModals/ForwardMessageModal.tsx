import { Loader } from "@/components/common/Loader"
import { ErrorBanner } from "@/components/layout/AlertBanner"
import { Flex, Dialog, IconButton, Text } from "@radix-ui/themes"
import { Suspense, lazy, useState } from "react"
import { BiX } from "react-icons/bi"
import { Message } from "../../../../../../../types/Messaging/Message"
import Tiptap from "../../ChatInput/Tiptap"
import { ChannelListItem } from "@/utils/channel/ChannelListProvider"
import { UserFields } from "@/utils/users/UserListProvider"
import ChannelAndUserComboBox from "@/components/feature/channel-and-user-combobox/ChannelAndUserComboBox"
import { FormProvider, useForm } from "react-hook-form"
import { useToast } from "@/hooks/useToast"

interface ForwardMessageModalProps {
    onClose: (refresh?: boolean) => void,
    message: Message
}

interface ForwardMessageForm {
    selected_options: (UserFields | ChannelListItem)[] | null,
    message: Message
}

const ForwardMessageModal = ({ onClose, message }: ForwardMessageModalProps) => {

    const [selectedOptions, setSelectedOptions] = useState<(UserFields | ChannelListItem)[]>([])

    const methods = useForm<ForwardMessageForm>({
        defaultValues: {
            selected_options: null,
            message: message
        }
    })

    const { handleSubmit, control } = methods
    const { toast } = useToast()

    const onSubmit = (data: ForwardMessageForm) => {
        if (data.selected_options && data.selected_options.length > 0) {
            const promises = data.selected_options.map(async (option) => {
                // return post call to forward message
            })

            Promise.all(promises)
                .then(() => {
                    toast({
                        title: 'Message forwarded successfully',
                        variant: 'success',
                        duration: 1000
                    })
                    onClose()
                })
        }
    }

    return (
        <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)}>
                <Flex justify={'between'}>
                    <Dialog.Title>Forward Message</Dialog.Title>
                    <Dialog.Close
                    // disabled={loading}
                    >
                        <IconButton size='1' variant="soft" color="gray">
                            <BiX size='18' />
                        </IconButton>
                    </Dialog.Close>
                </Flex>

                <Flex gap='2' direction='column'>
                    <ChannelAndUserComboBox selectedOptions={selectedOptions} setSelectedOptions={setSelectedOptions} />
                    {/* <ErrorBanner error={error} /> */}
                    <Suspense fallback={<Loader />}>
                        <Tiptap slotAfter={
                            <Flex gap='2'>
                                <Text size='1' color='gray'>Forwarding message:</Text>
                                <Text size='1' color='gray'>{message.text}</Text>
                            </Flex>
                        } placeholder="Type your message here (optional)" onMessageSend={function (message: string, json: any): Promise<void> {
                            throw new Error("Function not implemented.")
                        }} messageSending={false} />
                    </Suspense>
                    <Flex justify='end'>
                        <Text size='1' color='gray'>Press <b>Enter</b> to save</Text>
                    </Flex>
                </Flex>
            </form>
        </FormProvider>
    )
}

export default ForwardMessageModal