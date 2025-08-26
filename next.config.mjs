/** @type {import('next').NextConfig} */
const nextConfig = {
  // genkit, a dependency of this app, depends on handlebars, which has a
  // dependency on the `require.extensions` webpack feature. This is being
  // deprecated, and the nextjs team recommends adding it to the list of
  // server-side external packages to avoid breaking the build.
  //
  // See: https://github.com/firebase/genkit/issues/105
  serverComponentsExternalPackages: ['handlebars'],
};

export default nextConfig;
