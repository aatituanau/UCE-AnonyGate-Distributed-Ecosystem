import os

def fix_imports(file_path, replacements):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    for old, new in replacements.items():
        content = content.replace(old, new)
        
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

base = r"c:\Users\Usuario\Desktop\Distribuida\FINAL\UCE-AnonyGate-Distributed-Ecosystem\apps\ms-status\src"

f = os.path.join(base, "application", "services", "notification.service.ts")
fix_imports(f, {
    "from '../infrastructure/adapters/inbound/websocket/status.gateway'": "from '../../infrastructure/adapters/inbound/websocket/status.gateway'",
    "from '../infrastructure/adapters/outbound/mqtt/mqtt-alert.service'": "from '../../infrastructure/adapters/outbound/mqtt/mqtt-alert.service'"
})

f = os.path.join(base, "application", "services", "status.service.ts")
fix_imports(f, {
    "import { CaseStatus, StatusHistory } from '../../domain/entities/case-status.entity';": "import { CaseStatus } from '../../domain/entities/case-status.entity';\nimport { StatusHistory } from '../../generated/prisma';",
})

f = os.path.join(base, "infrastructure", "adapters", "inbound", "http", "status.controller.ts")
fix_imports(f, {
    "from '../../../application/services/status.service'": "from '../../../../application/services/status.service'",
    "from '../../../common/guards/alias-token.guard'": "from '../../../../common/guards/alias-token.guard'",
    "from '../../../common/guards/jwt-auth.guard'": "from '../../../../common/guards/jwt-auth.guard'"
})

f = os.path.join(base, "infrastructure", "adapters", "inbound", "websocket", "status.gateway.ts")
fix_imports(f, {
    "from '../../../common/guards/jwt-auth.guard'": "from '../../../../common/guards/jwt-auth.guard'",
    "from '../outbound/redis/redis-session.service'": "from '../../outbound/redis/redis-session.service'"
})

f = os.path.join(base, "infrastructure", "adapters", "outbound", "prisma", "prisma-status.repository.ts")
fix_imports(f, {
    "import { CaseStatus, StatusHistory } from '../../../../domain/entities/case-status.entity';": "import { CaseStatus } from '../../../../domain/entities/case-status.entity';\nimport { StatusHistory } from '../../../../generated/prisma';",
})

f = os.path.join(base, "infrastructure", "adapters", "outbound", "prisma", "prisma.service.ts")
fix_imports(f, {
    "from '../../../generated/prisma'": "from '../../../../generated/prisma'"
})

f = os.path.join(base, "infrastructure", "module", "status.module.ts")
fix_imports(f, {
    "from '../../../application/services/status.service'": "from '../../application/services/status.service'",
    "from '../../../application/services/notification.service'": "from '../../application/services/notification.service'",
    "from '../../../common/strategies/jwt.strategy'": "from '../../common/strategies/jwt.strategy'",
    "from '../../../common/guards/alias-token.guard'": "from '../../common/guards/alias-token.guard'",
    "from '../../../common/guards/jwt-auth.guard'": "from '../../common/guards/jwt-auth.guard'"
})

f = os.path.join(base, "main.ts")
fix_imports(f, {
    # No path fix needed for platform-socket.io, npm install will solve it
})
