import { RavenUser } from '@/types/Raven/RavenUser'
import { useFrappeGetCall } from 'frappe-react-sdk'

const useCurrentRavenUser = () => {

    const { data, mutate } = useFrappeGetCall<{ message: RavenUser }>('raven.api.raven_users.get_current_raven_user',
        undefined,
        'my_profile',
        {
            revalidateIfStale: true,
            revalidateOnFocus: false,
            dedupingInterval: 1000 * 60 * 15, // 5 minutes
            shouldRetryOnError: false,
            revalidateOnReconnect: true
        }
    )

    return {
        myProfile: data?.message,
        mutate
    }

}

export default useCurrentRavenUser