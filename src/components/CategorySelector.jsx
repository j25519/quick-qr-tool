import { Listbox } from '@headlessui/react'

function CategorySelector({ categories, selected, onSelect }) {
  return (
    <Listbox value={selected} onChange={onSelect}>
      <div className="relative">
        <Listbox.Button className="w-full p-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
          {selected.name}
        </Listbox.Button>
        <Listbox.Options className="absolute w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg z-[100] max-h-80 overflow-y-auto">
          {categories.map((cat) => (
            <Listbox.Option
              key={cat.id}
              value={cat}
              className={({ active }) =>
                `p-3 cursor-pointer transition-colors duration-200 ${
                  active ? 'bg-gray-100 dark:bg-gray-700' : ''
                } hover:bg-gray-50 dark:hover:bg-gray-600`
              }
            >
              {cat.name}
            </Listbox.Option>
          ))}
        </Listbox.Options>
      </div>
    </Listbox>
  )
}

export default CategorySelector