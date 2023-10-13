import { NextRequest, NextResponse } from "next/server";
import { prisma } from '@/server/prisma';
import { env } from "@/env.mjs";

export async function POST(request: NextRequest) {
    const data = await request.formData()
    const id = data.get('id') as string
    const path = data.get('path') as string
    const filename = data.get('filename') as string
    const comment = data.get('comment') as string

    if ((!id && (!path && !filename)) || typeof comment !== 'string') {
        return new NextResponse(JSON.stringify({ ok: false }), { status: 400 })
    }

    if (!id) {
        prisma.file.create({
            data: {
                path: path.replace('home/', env.MOUNT_DIR),
                filename,
                comment
            }
        })
    } else {
        await prisma.file.update({
            where: {
                id,
            },
            data: {
                comment,
            }
        })
    }

    return NextResponse.json({ ok: true })
}
