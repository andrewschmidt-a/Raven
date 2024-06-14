import { useFrappeAuth, useSWRConfig } from 'frappe-react-sdk'
import { FC, PropsWithChildren } from 'react'
import { createContext } from 'react'

interface UserContextProps {
    isLoading: boolean,
    currentUser: string,
    logout: () => Promise<void>,
    updateCurrentUser: VoidFunction,
}

export const UserContext = createContext<UserContextProps>({
    currentUser: '',
    isLoading: false,
    logout: () => Promise.resolve(),
    updateCurrentUser: () => { },
})

export const UserProvider: FC<PropsWithChildren> = ({ children }) => {

    const { cache } = useSWRConfig()
    const { logout, currentUser, updateCurrentUser, isLoading } = useFrappeAuth({
        revalidateIfStale: true,
        dedupingInterval: 1000 * 60 * 15, // 5 minutes
    })

    const handleLogout = async () => {
        localStorage.removeItem('ravenLastChannel')
        localStorage.removeItem('app-cache')

        return logout()
            .then(() => {
                //Clear cache on logout
                const keys = cache.keys()

                while (true) {
                    const key = keys.next()
                    if (key.done) break
                    cache.delete(key.value)
                }
            })
            .then(() => {
                //Reload the page so that the boot info is fetched again
                const URL = import.meta.env.VITE_BASE_NAME ? `${import.meta.env.VITE_BASE_NAME}` : ``
                if (URL) {
                    window.location.replace(`/${URL}/login`)
                } else {
                    window.location.replace('/login')
                }
            })
    }

    return (
        <UserContext.Provider value={{ isLoading, updateCurrentUser, logout: handleLogout, currentUser: currentUser ?? "" }}>
            {children}
        </UserContext.Provider>
    )
}