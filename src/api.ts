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

    public constructor() {
    }

    public async getUser(id: string, root: string): Promise<User> {
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
            const searchRegex = new RegExp(`<title>${id} \\((.*)\\)<\\/title>`, "g")
            const match = searchRegex.exec(responseText)
            if (match) {
                data.name = match[1] || data.name
            }
        } catch (e) {
            console.log(e)
            console.error(`Could not get user ${id}`)
        }
        return new User(data)
    }
}
