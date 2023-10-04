import { NextRequest, NextResponse } from "next/server";
import { prisma } from '@/server/prisma';

export async function POST(request: NextRequest) {
    const data = await request.formData()
    const id = data.get('id') as string
    const comment = data.get('comment') as string

    if (!id || typeof comment !== 'string') {
        return new NextResponse(JSON.stringify({ ok: false }), { status: 400 })
    }

    await prisma.file.update({
        where: {
            id,
        },
        data: {
            comment,
        }
    })
    return NextResponse.json({ ok: true })
}
