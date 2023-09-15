import React, { memo, useContext, useMemo } from 'react'
import { FileMessage, Message, MessageBlock, TextMessage } from '../../../../../../types/Messaging/Message'
import { ChannelMembersMap } from '../ChatInterface'
import { IonIcon, IonItem, IonSkeletonText, IonText } from '@ionic/react'
import { SquareAvatar, UserAvatar } from '@/components/common/UserAvatar'
import { MarkdownRenderer } from '@/components/common/MarkdownRenderer'
import { UserFields } from '@/utils/users/UserListProvider'
import { DateObjectToFormattedDateString, DateObjectToFormattedDateStringWithoutYear, DateObjectToTimeString } from '@/utils/operations/operations'
import { useFrappeGetDoc } from 'frappe-react-sdk'
import { ChannelMembersContext } from './ChatView'
import { openOutline } from 'ionicons/icons'
import { Haptics, ImpactStyle } from '@capacitor/haptics'
import { useIsUserActive } from '@/hooks/useIsUserActive'
import { useInView } from 'react-intersection-observer';

type Props = {
    message: MessageBlock,
}

export const MessageBlockItem = ({ message }: Props) => {
    const members = useContext(ChannelMembersContext)
    /**
     * Displays a message block in the chat interface
     * A message can have the following properties:
     * 1. Is Continuation - if it is, no need to show Avatar and timestamp
     * 2. Is Reply - if it is, show the reply message above the message in the same box
     * 3. Message Type - Text, Image, File - will need to show the content accordingly
     */

    const user = members[message.data.owner]
    return (
        <div className='px-2 my-0' id={`message-${message.data.name}`}>
            {message.data.is_continuation === 0 ? <NonContinuationMessageBlock message={message} user={user} /> :
                <ContinuationMessageBlock message={message} />}
        </div>
    )
}

const NonContinuationMessageBlock = ({ message, user }: { message: MessageBlock, user?: UserFields }) => {
    return <div className='px-2 mt-3 pt-1 rounded-md flex active:bg-[color:var(--ion-color-light)]'>
        <UserAvatarBlock message={message} user={user} />
        <div>
            <div className='flex items-end'>
                <IonText className='font-black text-sm'>{user?.full_name ?? message.data.owner}</IonText>
                <IonText className='text-xs pl-1.5 text-zinc-500'>{DateObjectToTimeString(message.data.creation)}</IonText>
            </div>
            <MessageContent message={message} />
        </div>
    </div>
}

const UserAvatarBlock = ({ message, user }: { message: MessageBlock, user?: UserFields }) => {

    const isActive = useIsUserActive(user?.name ?? message.data.owner)
    return <div className='w-11 mt-0.5'>
        <SquareAvatar alt={user?.full_name ?? message.data.owner} src={user?.user_image} isActive={isActive} />
    </div>
}

const ContinuationMessageBlock = ({ message }: { message: MessageBlock }) => {
    return <div className='px-2 flex rounded-md  active:bg-[color:var(--ion-color-light)]'>
        <div className='w-11'>
        </div>
        <MessageContent message={message} />
    </div>
}

const MessageContent = ({ message }: { message: MessageBlock }) => {

    return <div className='min-w-[100px] max-w-[280px]'>
        {message.data.is_reply === 1 && message.data.linked_message && <ReplyBlock linked_message={message.data.linked_message} />}
        {message.data.message_type === 'Text' && <div className='text-zinc-300'><TextMessageBlock message={message.data} /></div>}
        {message.data.message_type === 'Image' && <ImageMessageBlock message={message.data} />}
        {message.data.message_type === 'File' && <FileMessageBlock message={message.data} />}
    </div>
}

const TextMessageBlock = ({ message, truncate = false }: { message: TextMessage, truncate?: boolean }) => {


    return <div className='py-0.5 rounded-lg'>
        <MarkdownRenderer content={message.text} truncate={truncate} />
    </div>
}
const options = {
    root: null,
    rootMargin: "100px",
    threshold: 0.5,
    triggerOnce: true
};

const ImageMessageBlock = ({ message }: { message: FileMessage }) => {
    const { ref, inView } = useInView(options);
    //TODO: Pass the height and width of the image beforehand to avoid layout shift
    return <div className='py-1.5 rounded-lg' ref={ref}>
        {inView ?
            <img src={message.file} alt={`Image`} loading='lazy' className='rounded-md max-h-60 min-h-30 object-cover' />
            : <IonSkeletonText animated className='w-60 h-60 rounded-md' />}
    </div>
}

const FileMessageBlock = ({ message }: { message: FileMessage }) => {

    return <div className='py-0.5 my-1 rounded-md bg-zinc-900'>
        <p className='p-2 text-sm text-zinc-300'>
            📎 &nbsp;{message.file?.split('/')[3]}
        </p>
        <div className='mt-2 text-center'>
            <a
                className='w-full py-2 flex 
                items-center 
                space-x-1.5 
                justify-center border-t-2
                rounded-b-md
                border-t-zinc-800
                text-blue-400
                text-sm
                active:bg-blue-500
                active:text-zinc-300'
                target='_blank'
                href={message.file}
            >
                <span>View File</span>
                <IonIcon icon={openOutline} className='inline-block ml-1' />
            </a>
        </div>
    </div>
}

const ReplyBlock = ({ linked_message }: { linked_message: string }) => {
    const members = useContext(ChannelMembersContext)
    const { data } = useFrappeGetDoc<Message>('Raven Message', linked_message)

    const user = useMemo(() => {
        if (data) {
            return members[data.owner]
        } else {
            return undefined
        }
    }, [data])

    const scrollToMessage = () => {
        Haptics.impact({
            style: ImpactStyle.Light
        })
        document.getElementById(`message-${linked_message}`)?.scrollIntoView({ behavior: 'smooth' })
    }

    const date = data ? new Date(data?.creation) : null
    return <div onClick={scrollToMessage} className='px-2 py-1.5 my-2 rounded-e-sm bg-neutral-900 border-l-4 border-l-neutral-500'>
        {data && <div>
            <div className='flex items-end pb-1'>
                <IonText className='font-bold text-sm'>{user?.full_name ?? data.owner}</IonText>
                {date && <IonText className='font-normal text-xs pl-2' color='medium'>on {DateObjectToFormattedDateStringWithoutYear(date)} at {DateObjectToTimeString(date)}</IonText>}
            </div>
            {data.message_type === 'Text' && <div className='text-sm text-neutral-400'><TextMessageBlock message={data} truncate /></div>}
            {data.message_type === 'Image' && <div className='flex items-center space-x-2'>
                <img src={data.file} alt={`Image`} className='inline-block w-10 h-10 rounded-md' />
                <p className='text-sm font-semibold'>📸 &nbsp;Image</p>
            </div>}
            {data.message_type === 'File' && <p
                className='text-sm font-semibold'>📎 &nbsp;{data.file?.split('/')[3]}</p>}
        </div>
        }
    </div>
}