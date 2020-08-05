import "isomorphic-fetch"

interface GitHubUser {
    id: string;
    name: string;
}

export class User {
    private user: GitHubUser

    public constructor(user: GitHubUser) {
        this.user = user
    }

    public getName(): string {
        if (this.user && this.user.name) {
            return this.user.name
        }
        return ""
    }

    public getId(): string {
        return this.user.id + ""
    }
}

export class API3 {
    private cache: Map<string, Promise<User>>

    public constructor() {
        this.cache = new Map()
    }

    public async getUser(id: string, root: string): Promise<User> {
        if (!this.cache.has(`${id}-${root}`)) {
            this.cache.set(`${id}-${root}`, this.getUserFromGitHub(id, root))
        }
        return this.cache.get(`${id}-${root}`) as Promise<User>
    }

    public async getUserFromGitHub(id: string, root: string): Promise<User> {
        let data: GitHubUser = {
            id: id,
            name: id
        }
        try {
            const response = await fetch(`https://${root}/${id}`, {
                method: "GET",
                cache: "force-cache"
            })
            const responseText = await response.text()
            const searchRegex = new RegExp(`<title>${id} \\((.*)\\)(?: · GitHub)?<\\/title>`, "g")
            const match = searchRegex.exec(responseText)
            if (match) {
                // remove UserID from name, if it contains it.
                const fixedName = match[1].replace(id,"").trim()
                data.name = fixedName || data.name
            }
        } catch (e) {
            console.log(e)
            console.error(`Could not get user ${id}`)
        }
        return new User(data)
    }
}
