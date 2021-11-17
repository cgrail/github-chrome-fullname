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
    private localStorageKey = 'GITHUB_FULLNAME_CACHE'
    private newEntries: Record<string, User> = {}

    public constructor() {
        this.cache = new Map()
        if (localStorage.getItem(this.localStorageKey)) {
            try {
                const savedValues = JSON.parse(localStorage.getItem(this.localStorageKey) || '{}')
                for (const userkey in savedValues) {
                    this.cache.set(userkey, Promise.resolve(new User(savedValues[userkey].user)))
                }
            } catch (error) { }
        }
    }

    public async getUser(id: string, root: string): Promise<User> {
        if (!this.cache.has(`${id}-${root}`)) {
            this.cache.set(`${id}-${root}`, this.getUserFromGitHub(id, root).then((user): User => {
                this.newEntries[`${id}-${root}`] = user
                this.saveInLocalStorage()
                return user
            }))
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
            const searchRegex = new RegExp(`<title>${id} \\((.*)\\)<\\/title>`, "g")
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

    // Flag to throttle saving in localStorage by 5 sec.
    private scheduledForSync = false;

    private saveInLocalStorage(): void {
        if (!this.scheduledForSync) {
            this.scheduledForSync = true;

            setTimeout((): void => {
                this.scheduledForSync = false;
                const cachedEntries = {};
                try {
                    Object.assign(cachedEntries, JSON.parse(localStorage.getItem(this.localStorageKey) || '{}'))
                } catch { }
                Object.assign(cachedEntries, this.newEntries)

                localStorage.setItem(this.localStorageKey, JSON.stringify(cachedEntries))
                this.newEntries = {}
            }, 5000);
        }
    }
}
