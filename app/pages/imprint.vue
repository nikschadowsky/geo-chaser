<script setup lang="ts">

</script>

<template>
  <LanguageSelect class="absolute top-4 left-4"/>
  <div class="w-full flex flex-col pl-20 py-40">
    <NuxtLink to="/maps">
      <h1 class="text-4xl font-bold">Geo<span class="text-primary">Chaser</span></h1>
    </NuxtLink>
    <h1 class="text-4xl mt-20">{{ $t('imprint-title') }}</h1>

    <p>Nik Schadowsky</p>
    <p>Lengerckestraße 40</p>
    <p>22041 Hamburg</p>
    <p>Germany</p>

    <h2 class="text-2xl mt-10">{{ $t('imprint-contact-title') }}</h2>
    <p>{{ $t('telephone') }}: +49 152 05147503</p>
    <p>{{ $t('email') }}: <a href="mailto:info@nikschadowsky.de" class="text-primary">info@nikschadowsky.de</a></p>
    <p class="mt-8">{{ $t('source') }}: <a href="https://www.e-recht24.de" rel="noopener noreferrer"
                                           class="text-primary">e-recht24.de</a>
    </p>
    <h2 class="text-2xl mt-10">{{ $t('geo-sources') }}</h2>
    <p>{{ $t('geo-sources-desc') }}:</p>
    <ul class="list-disc pl-4">
      <li><span class="text-primary">Berlin:</span> Geoportal Berlin / Ortsteile von Berlin &bullet; Datenlizenz
        Deutschland – Zero – Version 2.0 &bullet; <a
            href="https://tsb-opendata.s3.eu-central-1.amazonaws.com/ortsteile/lor_ortsteile.geojson"
            class="text-primary"
            rel="noopener noreferrer"
            target="_blank"
        >{{ $t('resource-link') }}<i class="pi pi-arrow-up-right"/></a></li>
      <li><span class="text-primary">Frankfurt:</span> Stadt Frankfurt a.M., Bürgeramt Statistik und Wahlen &bullet;
        Datenlizenz Deutschland – Namensnennung – Version 2.0 &bullet; <a
            href="https://hub.arcgis.com/datasets/esri-de-content::stadtteile-frankfurt-am-main/about"
            class="text-primary"
            rel="noopener noreferrer"
            target="_blank"
        >{{ $t('resource-link') }}<i class="pi pi-arrow-up-right"/></a></li>
      <li><span class="text-primary">Gießen:</span> &copy;OpenStreetMap contributors &bullet; Open Data Commons Open
        Database License &bullet; <a
            href="https://overpass-turbo.eu/"
            class="text-primary"
            rel="noopener noreferrer"
            target="_blank"
        >{{ $t('resource-link') }}<i class="pi pi-arrow-up-right"/></a></li>
      <li><span class="text-primary">Hamburg:</span> Freie und Hansestadt Hamburg, Landesbetrieb Geoinformation und
        Vermessung (LGV) &bullet; Datenlizenz Deutschland – Namensnennung – Version 2.0 &bullet; <a
            href="https://archiv.transparenz.hamburg.de/hmbtgarchive/HMDK/hh_wfs_verwaltungsgrenzen_215642_snap_29.GML"
            class="text-primary"
            rel="noopener noreferrer"
            target="_blank"
        >{{ $t('resource-link') }}<i class="pi pi-arrow-up-right"/></a>
      </li>
      <li><span class="text-primary">München:</span> GeodatenService München &bullet; Datenlizenz Deutschland –
        Namensnennung – Version 2.0 &bullet; <a
            href="https://opendata.muenchen.de/dataset/vablock_stadtbezirke_opendata/resource/de2af3e6-86b6-43ce-876e-92ec251e22f1"
            class="text-primary"
            rel="noopener noreferrer"
            target="_blank"
        >{{ $t('resource-link') }}<i class="pi pi-arrow-up-right"/></a></li>
      <li><span class="text-primary">Wien:</span> Stadt Wien &bullet; <a
          href="https://creativecommons.org/licenses/by/4.0/deed.de" rel="noopener noreferrer" target="_blank">
        CC BY 4.0
      </a>
        &bullet; <a
            href="https://www.data.gv.at/katalog/datasets/2ee6b8bf-6292-413c-bb8b-bd22dbb2ad4b"
            class="text-primary"
            rel="noopener noreferrer"
            target="_blank"
        >{{ $t('resource-link') }}<i class="pi pi-arrow-up-right"/></a></li>
    </ul>
  </div>
</template>

<style scoped>

</style>