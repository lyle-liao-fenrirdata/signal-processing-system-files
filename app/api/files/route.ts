import * as fs from 'node:fs/promises';
import { NextRequest, NextResponse } from "next/server";
import { env } from '@/env.mjs';
import { prisma } from '@/server/prisma';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const inputDir = searchParams.get('dir') || 'home/'

    try {
        await fs.access(env.MOUNT_DIR, fs.constants.R_OK)
    } catch (e) {
        await fs.mkdir(env.MOUNT_DIR)
    }

    const dir = inputDir.replace('home/', env.MOUNT_DIR);

    try {
        await fs.access(dir, fs.constants.R_OK)
    } catch (e) {
        return NextResponse.error()
    }

    const dirFiles = await fs.readdir(dir, {
        withFileTypes: true,
    });

    const dirMongo = await prisma.file.findMany({
        where: {
            path: dir,
        }
    })
    console.log({ dir, dirFiles: dirFiles.map((d) => d.name), dirMongo })

    const files = (await Promise.all(dirFiles.filter((dirent) => dirent.isFile()).map(async (dirent) => {
        const { birthtimeMs, size } = await fs.stat(`${dir}${dirent.name}`)
        const mongo = dirMongo.find((dm) => dm.filename === dirent.name)
        return { birthtimeMs, size, comment: mongo?.comment, id: mongo?.id, name: dirent.name }
    }))).filter((f) => f.id);

    const dirs = await Promise.all(dirFiles.filter((dirent) => dirent.isDirectory()).map(async (dirent) => {
        const dirDirent = await fs.readdir(`${dir}${dirent.name}`, {
            withFileTypes: true,
        });
        const nfiles = dirDirent.filter((dirent) => dirent.isFile()).length
        const ndirs = dirDirent.filter((dirent) => dirent.isDirectory()).length
        return { nfiles, ndirs, name: dirent.name }
    }));

    return NextResponse.json({
        files,
        dirs,
    });
}

export async function POST(request: Request) {
    const data = await request.formData()
    const dir: string = data.get('dir') as string
    const file: File | null = data.get('file') as unknown as File

    if (!file || !dir) {
        return NextResponse.json({ ok: false })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const path = dir.replace('home/', env.MOUNT_DIR);
    const filePath = `${path}${file.name}`

    // check if file already exist
    // console.log("\x1b[43m", path, "\x1b[0m");
    // console.log("\x1b[43m", filePath, "\x1b[0m");
    try {
        await fs.access(filePath, fs.constants.F_OK)
        return NextResponse.json({ ok: false })
    } catch { }
    await prisma.file.create({
        data: {
            path,
            filename: file.name,
        }
    })
    await fs.writeFile(filePath, buffer)
    return NextResponse.json({ ok: true })
}

export async function PUT(request: Request) {
    const dirname = await request.text()
    if (!dirname) return NextResponse.json({ ok: false });

    const path = dirname.replace('home/', env.MOUNT_DIR);

    // check if file already exist
    try {
        await fs.access(path, fs.constants.F_OK)
        return NextResponse.json({ ok: false })
    } catch { }
    await fs.mkdir(path, { recursive: true })
    return NextResponse.json({ ok: true })
}

export async function DELETE(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const dirToDel = searchParams.get('dirToDel')

    if (!dirToDel) return NextResponse.json({ ok: false });

    const dirname = decodeURIComponent(dirToDel);
    const path = dirname.replace('home/', env.MOUNT_DIR);

    // check if file already exist
    try {
        await fs.access(path, fs.constants.F_OK)
    } catch {
        return NextResponse.json({ ok: false })
    }

    if (dirname.charAt(dirname.length - 1) === '/') {
        await prisma.file.deleteMany({
            where: {
                path,
            }
        })
        await fs.rmdir(path, { recursive: true })
    } else {
        const lastSlash = path.lastIndexOf('/');
        const p = path.slice(0, lastSlash + 1);
        const n = path.slice(lastSlash + 1);
        await prisma.file.deleteMany({
            where: {
                path: p,
                filename: n,
            }
        })
        await fs.rm(path)
    }
    return NextResponse.json({ ok: true })
}

export async function PATCH(request: Request) {
    let oldPath: string = "";
    let newPath: string = "";
    try {
        const body = await request.json()
        oldPath = body.oldPath
        newPath = body.newPath
    } catch {
        return NextResponse.json({ ok: false })
    }

    if (!oldPath || !newPath) {
        return NextResponse.json({ ok: false })
    }

    oldPath = oldPath.replace('home/', env.MOUNT_DIR);
    newPath = newPath.replace('home/', env.MOUNT_DIR);

    // check if new dir not exist
    try {
        await fs.access(newPath, fs.constants.F_OK)
        return NextResponse.json({ ok: false })
    } catch { }
    // check if old dir already exist
    try {
        await fs.access(oldPath, fs.constants.F_OK)
    } catch {
        return NextResponse.json({ ok: false })
    }
    await prisma.file.updateMany({
        where: {
            path: oldPath,
        },
        data: {
            path: newPath,
        }
    })
    await fs.rename(oldPath, newPath)
    return NextResponse.json({ ok: true })
}

// console.log("\x1b[43m", dir, "\x1b[0m");
