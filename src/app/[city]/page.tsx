import { redirect } from 'next/navigation'

interface Props {
    params: { city: string }
}

export default function CityPage({ params }: Props) {
    redirect(`/${params.city}/activities`)
}
