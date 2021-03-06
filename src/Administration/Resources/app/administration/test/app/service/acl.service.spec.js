import AclService from 'src/app/service/acl.service';

describe('src/app/service/acl.service.js', () => {
    beforeAll(() => {
        Shopware.Service().register('feature', () => {
            return {
                isActive: () => true
            };
        });
    });

    beforeEach(() => {
        Shopware.Application.view = {};
        Shopware.Application.view.root = {};
        Shopware.Application.view.root.$router = {};
        Shopware.Application.view.root.$router.match = () => ({});
    });

    it('should be an admin', async () => {
        const aclService = new AclService({
            get: () => ({ currentUser: { admin: true } })
        });

        expect(aclService.isAdmin()).toBeTruthy();
    });

    it('should not be an admin', async () => {
        const aclService = new AclService({
            get: () => ({ currentUser: { admin: false } })
        });

        expect(aclService.isAdmin()).toBeFalsy();
    });

    it('should allow every privilege as an admin', async () => {
        const aclService = new AclService({
            get: () => ({ currentUser: { admin: true } }),
            getters: {
                userPrivileges: []
            }
        });

        expect(aclService.can('system.clear_cache')).toBeTruthy();
    });

    it('should disallow when privilege does not exists', async () => {
        const aclService = new AclService({
            get: () => ({ currentUser: { admin: false } }),
            getters: {
                userPrivileges: []
            }
        });

        expect(aclService.can('system.clear_cache')).toBeFalsy();
    });

    it('should allow when privilege exists', async () => {
        const aclService = new AclService({
            get: () => ({ currentUser: { admin: false } }),
            getters: {
                userPrivileges: ['system.clear_cache']
            }
        });

        expect(aclService.can('system.clear_cache')).toBeTruthy();
    });

    it('should return all privileges', async () => {
        const aclService = new AclService({
            get: () => ({ currentUser: { admin: false } }),
            getters: {
                userPrivileges: [
                    'system.clear_cache',
                    'orders.create_discounts'
                ]
            }
        });

        expect(aclService.privileges).toContain('system.clear_cache');
        expect(aclService.privileges).toContain('orders.create_discounts');
    });

    it('should return true if router is undefined', async () => {
        Shopware.Application.view.root.$router = null;

        const aclService = new AclService({
            get: () => ({ currentUser: { admin: false } }),
            getters: {
                userPrivileges: [
                    'product.viewer'
                ]
            }
        });

        expect(aclService.hasAccessToRoute('sw.product.index')).toBeTruthy();
    });

    it('should have access to the route when no privilege exists', async () => {
        Shopware.Application.view.root.$router.match = () => ({});

        const aclService = new AclService({
            get: () => ({ currentUser: { admin: false } }),
            getters: {
                userPrivileges: [
                    'product.viewer'
                ]
            }
        });

        expect(aclService.hasAccessToRoute('sw.product.index')).toBeTruthy();
    });

    it('should not have access to the route when privilege not matches', async () => {
        Shopware.Application.view.root.$router.match = () => ({
            meta: {
                privilege: 'category.viewer'
            }
        });

        const aclService = new AclService({
            get: () => ({ currentUser: { admin: false } }),
            getters: {
                userPrivileges: [
                    'product.viewer'
                ]
            }
        });

        expect(aclService.hasAccessToRoute('sw.product.index')).toBeFalsy();
    });

    it('should have access to the route when privilege matches', async () => {
        Shopware.Application.view.root.$router.match = () => ({
            meta: {
                privilege: 'product.viewer'
            }
        });

        const aclService = new AclService({
            get: () => ({ currentUser: { admin: false } }),
            getters: {
                userPrivileges: [
                    'product.viewer'
                ]
            }
        });

        expect(aclService.hasAccessToRoute('sw.product.index')).toBeTruthy();
    });
});
