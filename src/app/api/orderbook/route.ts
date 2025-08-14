import { NextRequest, NextResponse } from 'next/server'
import { AmmAsOrderbook } from '@/interfaces'
import { isAddress } from 'viem'
import { extractErrorMessage, fetchWithTimeout, initOutput } from '@/utils'

export async function GET(req: NextRequest) {
    const res = initOutput<AmmAsOrderbook>()

    // safe exec
    try {
        // validation
        const { searchParams } = new URL(req.url)
        const chainName = searchParams.get('chain')
        const url = `https://www.orderbook.wtf/api/orderbook`
        const token0 = searchParams.get('token0')
        const token1 = searchParams.get('token1')
        const pointToken = searchParams.get('pointToken')
        const pointAmount = Number(searchParams.get('pointAmount'))
        if (!token0 || !isAddress(token0)) {
            res.error = `token0 must be a valid address`
            return NextResponse.json(res, { status: 500 })
        }
        if (!token1 || !isAddress(token1)) {
            res.error = `token1 must be a valid address`
            return NextResponse.json(res, { status: 500 })
        }

        // prepare request URL with query params
        const orderbookUrl = new URL(url)
        orderbookUrl.searchParams.append('chain', chainName || '')
        orderbookUrl.searchParams.append('token0', token0 || '')
        orderbookUrl.searchParams.append('token1', token1 || '')
        if (pointToken && !isNaN(Number(pointAmount))) {
            orderbookUrl.searchParams.append('pointToken', pointToken)
            orderbookUrl.searchParams.append('pointAmount', pointAmount.toString())
        }

        // debug
        console.log(orderbookUrl.toString())

        // run req
        const fetchResponse = await fetchWithTimeout(orderbookUrl.toString(), {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...(process.env.API_HEADER_KEY && process.env.API_HEADER_VALUE
                    ? {
                          [`${process.env.API_HEADER_KEY}`]: `${process.env.API_HEADER_VALUE}`,
                      }
                    : {}),
            },
            cache: 'no-store',
        })

        // error
        if (!fetchResponse.ok) {
            res.error = `Error fetching ${url}`
            return NextResponse.json(res, { status: fetchResponse.status })
        }

        // cast
        const fetchResponseJson = await fetchResponse.json()

        // Check if response is wrapped in StructuredOutput or is raw data
        if (fetchResponseJson.hasOwnProperty('success') && fetchResponseJson.hasOwnProperty('data')) {
            // Response is already a StructuredOutput
            res.error = fetchResponseJson.error
            res.data = fetchResponseJson.data
            res.success = fetchResponseJson.success
        } else {
            // Response is raw AmmAsOrderbook data
            res.data = fetchResponseJson as AmmAsOrderbook
            res.success = true
        }

        // double check errors - but only if there's no data
        if (!res.data && String(res.data).includes('error')) {
            return NextResponse.json({ ...res, error: `Upstream rust API returned an error` }, { status: 502 })
        }

        // If we have data, ensure success is true
        if (res.data) {
            res.success = true
            res.error = '' // Clear any error if we have data
        }

        // res with aggressive caching for 5 users
        return NextResponse.json(res, {
            headers: {
                'Cache-Control': 'public, s-maxage=5, stale-while-revalidate=15',
            },
        })
    } catch (error) {
        const parsedError = extractErrorMessage(error)

        // debug
        console.log({ parsedError })

        // res
        return NextResponse.json({ ...res, error: `Unexpected error while fetching orderbook: ${parsedError}` }, { status: 500 })
    }
}
