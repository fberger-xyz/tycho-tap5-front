import AppStoreLoader from '@/components/stores/AppStoreLoader'
import Home from '@/components/app/Home'

export default function Page() {
    return (
        <AppStoreLoader>
            <Home />
        </AppStoreLoader>
    )
}
