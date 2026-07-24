<template>
  <div class="grain relative flex min-h-svh flex-col">
    <ScrollProgress />
    <TheHeader />
    <TheMenu />
    <main class="flex-1 pt-16 lg:pt-20">
      <slot />
    </main>
    <TheFooter />
  </div>
</template>
