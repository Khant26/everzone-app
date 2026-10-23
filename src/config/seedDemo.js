// Fictional demo content so a fresh portfolio deployment is not empty.
// Runs only when SEED_DEMO=1 and only into empty tables, so it is safe to leave
// enabled: restarts never duplicate rows or overwrite edits made in /admin.
import pool from './database.js';

const img = (id) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&q=75`;

// The storefront's project tabs are fixed to these three category names.
export const DEMO_CATEGORIES = [
  { name: 'Residential', description: 'Private homes, villas and apartment buildings.' },
  { name: 'Commercial', description: 'Offices, retail and mixed-use developments.' },
  { name: 'Industrial', description: 'Warehouses, factories and logistics facilities.' },
];

export const DEMO_SERVICES = [
  {
    title: 'Building Construction',
    description:
      'End-to-end general contracting for residential, commercial and industrial buildings: site preparation, reinforced-concrete structures, masonry and finishing, delivered by our own site teams.',
    image: img('1504307651254-35680f356dfd'),
  },
  {
    title: 'Architectural & Structural Design',
    description:
      'Concept design, permit drawings and structural calculations prepared in-house, so the building that is drawn is the building that can be built on budget.',
    image: img('1503387762-592deb58ef4e'),
  },
  {
    title: 'Interior Decoration',
    description:
      'Space planning, custom joinery, lighting and furnishing packages for homes, showrooms and offices, from mood board to final styling.',
    image: img('1618221195710-dd6b41faaea6'),
  },
  {
    title: 'Renovation & Remodeling',
    description:
      'Kitchen and bathroom upgrades, layout changes and full refurbishments of occupied buildings, phased to keep disruption low.',
    image: img('1484154218962-a197022b5858'),
  },
  {
    title: 'MEP Installation',
    description:
      'Mechanical, electrical and plumbing works: power distribution, lighting, air-conditioning, water supply and drainage, tested and commissioned.',
    image: img('1621905251189-08b45d6a269e'),
  },
  {
    title: 'Steel Structure Fabrication',
    description:
      'Fabrication and erection of steel frames, roof trusses and mezzanines for warehouses and factories, with on-site welding and painting.',
    image: img('1504917595217-d4dc5ebe6122'),
  },
];

export const DEMO_PROJECTS = [
  // Residential
  {
    category: 'Residential',
    name: 'Golden Valley Villa',
    title: 'Two-storey luxury villa with pool',
    location: 'Bahan Township, Yangon',
    duration: '14 months',
    area: '6,200 sq ft',
    description:
      'A contemporary family villa with open-plan living spaces, a cantilevered first floor and a 15 m lap pool. Ever Zone handled design development, structure, MEP and the full interior fit-out.',
    image: img('1613490493576-7fde63acd811'),
  },
  {
    category: 'Residential',
    name: 'Inya Lake Residence',
    title: 'Lakeside house with terrace pool',
    location: 'Mayangon Township, Yangon',
    duration: '11 months',
    area: '4,800 sq ft',
    description:
      'A white-rendered modern residence arranged around a terrace pool, with large sliding glazing to bring in light and cross-ventilation during the hot season.',
    image: img('1600596542815-ffad4c1539a9'),
  },
  {
    category: 'Residential',
    name: 'Hlaing Garden Apartments',
    title: 'Eight-storey apartment building',
    location: 'Hlaing Township, Yangon',
    duration: '20 months',
    area: '42,000 sq ft',
    description:
      'Thirty-two two- and three-bedroom apartments over a ground-floor car park, built with a reinforced-concrete frame and a lightweight facade system.',
    image: img('1545324418-cc1a3fa10c00'),
  },
  {
    category: 'Residential',
    name: 'Pyin Oo Lwin Hillside Home',
    title: 'Timber-and-glass holiday home',
    location: 'Pyin Oo Lwin, Mandalay Region',
    duration: '9 months',
    area: '3,100 sq ft',
    description:
      'A compact weekend house set among mature trees, combining a concrete base with timber-clad upper volumes and full-height windows facing the garden.',
    image: img('1600585154340-be6161a56a0c'),
  },
  // Commercial
  {
    category: 'Commercial',
    name: 'Downtown Glass Tower',
    title: 'Office tower structural and facade works',
    location: 'Kyauktada Township, Yangon',
    duration: '26 months',
    area: '180,000 sq ft',
    description:
      'Core-and-shell construction of a high-rise office building with a unitised glass curtain wall, coordinated with the client\'s international design team.',
    image: img('1486406146926-c627a92ad1ab'),
  },
  {
    category: 'Commercial',
    name: 'Kamayut Co-working Hub',
    title: 'Open-plan co-working space fit-out',
    location: 'Kamayut Township, Yangon',
    duration: '4 months',
    area: '12,500 sq ft',
    description:
      'Conversion of a bare concrete floor into a bright co-working space with glass meeting rooms, exposed services and a shared kitchen.',
    image: img('1497366811353-6870744d04b2'),
  },
  {
    category: 'Commercial',
    name: 'Riverside Corporate Office',
    title: 'Corporate headquarters interior',
    location: 'Botahtaung Township, Yangon',
    duration: '6 months',
    area: '18,000 sq ft',
    description:
      'Reception, executive offices and open workspace for a regional headquarters, including raised floors, acoustic ceilings and a new HVAC system.',
    image: img('1497366216548-37526070297c'),
  },
  {
    category: 'Commercial',
    name: 'Mandalay Business Centre',
    title: 'Mixed-use commercial building',
    location: 'Chanayethazan Township, Mandalay',
    duration: '18 months',
    area: '65,000 sq ft',
    description:
      'Retail podium with offices above, featuring a faceted glass entrance hall and a rooftop events terrace.',
    image: img('1487958449943-2429e8be8625'),
  },
  // Industrial
  {
    category: 'Industrial',
    name: 'Thilawa Logistics Warehouse',
    title: 'High-bay distribution warehouse',
    location: 'Thilawa SEZ, Yangon Region',
    duration: '10 months',
    area: '120,000 sq ft',
    description:
      'Steel-framed warehouse with 12 m clear height, racking-ready slab, dock levellers and LED high-bay lighting for a third-party logistics operator.',
    image: img('1586528116311-ad8dd3c8310d'),
  },
  {
    category: 'Industrial',
    name: 'Hlaing Tharyar Truck Depot',
    title: 'Fleet depot and loading yard',
    location: 'Hlaing Tharyar Industrial Zone, Yangon',
    duration: '7 months',
    area: '250,000 sq ft site',
    description:
      'Heavy-duty concrete yard, covered loading bays and a maintenance workshop for a fleet of sixty trucks.',
    image: img('1565793298595-6a879b1d9492'),
  },
  {
    category: 'Industrial',
    name: 'Mingaladon Factory Expansion',
    title: 'Factory extension and foundations',
    location: 'Mingaladon Industrial Park, Yangon',
    duration: '12 months',
    area: '85,000 sq ft',
    description:
      'Ground improvement, piled foundations and a new production hall extending an existing food-processing plant while it stayed in operation.',
    image: img('1541888946425-d81bb19240f5'),
  },
];

// Fictional inquiries (example.com addresses) so the admin inbox is not empty.
export const DEMO_CONTACT_FORMS = [
  {
    name: 'Aung Min',
    email: 'aung.min@example.com',
    phone: '+95 9 400 000 001',
    message: 'We are planning a three-storey house in Thingangyun. Could you send a rough cost estimate and timeline?',
    status: 'pending',
  },
  {
    name: 'Su Su Hlaing',
    email: 'susu.hlaing@example.com',
    phone: '+95 9 400 000 002',
    message: 'Looking for an interior decoration package for a 2,000 sq ft office. Do you also supply the furniture?',
    status: 'reviewed',
  },
  {
    name: 'Daniel Tan',
    email: 'daniel.tan@example.com',
    phone: '+65 8000 0003',
    message: 'Our company needs a 40,000 sq ft warehouse near Thilawa. Please contact me to arrange a site visit.',
    status: 'pending',
  },
];

const count = async (client, table) =>
  Number((await client.query(`SELECT COUNT(*)::int AS n FROM ${table}`)).rows[0].n);

/**
 * Inserts the demo content into empty tables. Content (categories, services,
 * projects) is seeded together only when all three tables are empty; demo
 * inquiries only when contact_forms is empty. Returns what was inserted.
 */
const seedDemoData = async () => {
  const client = await pool.connect();
  const inserted = { categories: 0, services: 0, projects: 0, contactForms: 0 };
  try {
    await client.query('BEGIN');
    // Serialise concurrent starts (e.g. two replicas) on the same database.
    await client.query("SELECT pg_advisory_xact_lock(hashtext('everzone_seed_demo'))");

    const contentEmpty =
      (await count(client, 'categories')) === 0 &&
      (await count(client, 'services')) === 0 &&
      (await count(client, 'projects')) === 0;

    if (contentEmpty) {
      const categoryIds = {};
      for (const c of DEMO_CATEGORIES) {
        const { rows } = await client.query(
          'INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING id',
          [c.name, c.description]
        );
        categoryIds[c.name] = rows[0].id;
        inserted.categories += 1;
      }
      // Stagger created_at so the newest-first listings show them in file order.
      for (const s of DEMO_SERVICES) {
        await client.query(
          `INSERT INTO services (title, description, image, created_at, updated_at)
           VALUES ($1, $2, $3, NOW() - make_interval(secs => $4), NOW() - make_interval(secs => $4))`,
          [s.title, s.description, s.image, inserted.services + 1]
        );
        inserted.services += 1;
      }
      for (const [i, p] of DEMO_PROJECTS.entries()) {
        await client.query(
          `INSERT INTO projects (name, title, category_id, location, duration, area, description, image, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW() - make_interval(secs => $9), NOW() - make_interval(secs => $9))`,
          [p.name, p.title, categoryIds[p.category], p.location, p.duration, p.area, p.description, p.image, i + 1]
        );
        inserted.projects += 1;
      }
    }

    if ((await count(client, 'contact_forms')) === 0) {
      for (const [i, f] of DEMO_CONTACT_FORMS.entries()) {
        await client.query(
          `INSERT INTO contact_forms (name, email, phone, message, status, time, created_at)
           VALUES ($1, $2, $3, $4, $5, NOW() - make_interval(hours => $6), NOW() - make_interval(hours => $6))`,
          [f.name, f.email, f.phone, f.message, f.status, (i + 1) * 7]
        );
        inserted.contactForms += 1;
      }
    }

    await client.query('COMMIT');
    return inserted;
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    throw error;
  } finally {
    client.release();
  }
};

export default seedDemoData;
