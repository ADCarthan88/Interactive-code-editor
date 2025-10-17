export class VersionControl {
    constructor() {
        this.history = [];
        this.currentBranch = 'main';
        this.branches = new Map([['main', []]]);
    }
    
    commit(message, files) {
        const commit = {
            id: this.generateId(),
            message,
            files: new Map(files),
            timestamp: Date.now(),
            author: this.getCurrentUser()
        };

        this.branches.get(this.currentBranch).push(commit);
        return commit.id;
    }

    createBranch(name, fromCommit) {
        const baseCommits = this.getCommitsUpTo(fromCommit);
        this.branches.set(name, [...baseCommits]);
    }

    merge(sourceBranch, targetBranch) {
        const conflicts = this.detectConflicts(sourceBranch, targetBranch);
        if (conflicts.length > 0) {
            return { success: false, conflicts };
        }

        const sourceCommits = this.branches.get(sourceBranch);
        this.branches.get(targetBranch).push(...sourceCommits);
        return { success: true };
    }
}