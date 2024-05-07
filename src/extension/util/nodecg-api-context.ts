import { Configschema } from '@/configschema'
import type NodeCGTypes from '@nodecg/types'

let context: NodeCGTypes.ServerAPI<Configschema>

export function get(): NodeCGTypes.ServerAPI<Configschema> {
    return context
}

export function set(ctx: NodeCGTypes.ServerAPI<Configschema>): void {
    context = ctx
}
