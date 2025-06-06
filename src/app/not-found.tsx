import LinkWrapper from '@/components/common/LinkWrapper'
import PageWrapper from '@/components/common/PageWrapper'
import { APP_PAGES } from '@/config/app.config'
import { cn } from '@/utils'
import { redirect } from 'next/navigation'

export default function NotFound() {
    redirect(APP_PAGES[0].path)
    return (
        <PageWrapper>
            <div className="mt-40 mx-auto">
                <p>Not found.</p>

                <LinkWrapper
                    href={APP_PAGES[0].path}
                    className={cn('w-full p-4 hover:bg-default/10 rounded-xl cursor-pointer flex justify-center font-light text-default/50')}
                >
                    <p>Go back</p>
                </LinkWrapper>
            </div>
        </PageWrapper>
    )
}
